/**
 * Created by njuice on 08.09.15.
 */
(function(){
    var app = angular.module('tasks', ["ngCookies", "ngResource", "pusher-angular", "ui.sortable", "ui.bootstrap", "cgNotify"]);

    // Config $http for django backend
    app.config(function($httpProvider , $interpolateProvider, $resourceProvider){
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $resourceProvider.defaults.stripTrailingSlashes = false
    });

    // Api factories
    app.factory('Tasks', ['$http', function($http){

        var Tasks = function(data){
            angular.extend(this, data)
        };

        Tasks.getAll = function(userId) {
            return $http.get('/api/v1/items/?format=json&assigned_to=' + userId).then(function(response){
                // Replace string with Date object
                angular.forEach(response.data.objects, function(value, key){
                    response.data.objects[key]['due_to'] = new Date(response.data.objects[key]['due_to']);
                });
                return response;
            })
        };

        Tasks.get = function(id) {
            return $http.get('/api/v1/items/' + id + '/?format=json');
        };

        Tasks.save = function(task) {
            var url = '/api/v1/items/?format=json';
            return $http.post(url, task).error(function(data){
                console.log(data);
            });
        };

        Tasks.remove = function(id) {
            return $http.delete('/api/v1/items/' + id + '/?format=json');
        };
        return Tasks;

    }]);

    app.factory('Teams', ['$http', function($http){

        var Teams = function(data){
            angular.extend(this, data);
        };

        Teams.get = function(ownerId) {
            return $http.get('/api/v1/teams/?format=json&owner=' + ownerId);
        };
        return Teams;

    }]);

    app.factory('Teammates', ['$http', function($http){

        var Teammates = function(data){
            angular.extend(this, data);
        };

        Teammates.getAll = function(themeId) {
            return $http.get('/api/v1/teammates/?format=json&team=' + themeId);
        };
        return Teammates;
    }]);

    // Directives team member dng
    app.directive('draggable', function() {
        return {
            restrict:'A',
            link: function(scope, element, attrs) {
                element.draggable({
                    revert:true
                });
            }
        };
    });

    app.directive('droppable', function($compile, notify, $rootScope, $filter, Tasks) {
        return {
            restrict: 'A',
                link: function(scope,element,attrs){
                    element.droppable({
                    drop:function(event, ui) {

                        var dragEl = angular.element(ui.draggable),
                            dropEl = angular.element(this);

                        if(dragEl && dropEl){
                            var teammate = dragEl.scope()['teammate'],
                                task = dropEl.scope()['task'];
                            if(teammate && task) {

                                var found = $filter("filter")($rootScope.tasks, {id: task.id}, true);
                                if (found.length) {
                                    var found_assigned = $filter("filter")(task.assigned_to, {id: teammate.user.id}, true);
                                    if(!found_assigned.length) {
                                        task.assigned_to.push(teammate.user);
                                        $rootScope.tasks[found] = task;
                                        Tasks.save(task).success(function(data){
                                            notify({message: 'Task assigned!', templateUrl: '/static/html/angular-notify.html'});
                                        });
                                    }
                                }

                            }
                        }
                    }
                });
            }
        };
    });

    // Main app directive
    app.directive('tasksManagement', function(){
        return {
            restrict: 'E',
            templateUrl: '/static/html/tasks_manager.html',
            controller: function($log, $scope, $filter, $http, $pusher, Tasks, Teams, Teammates){

                $scope.show_team = false;
                this.current_user = null;
                $scope.new_task = {};
                $scope.tasks = [];
                $scope.team = null;
                $scope.teammates = [];

                /**
                 * Toggle team list
                 */
                $scope.showTeam = function(){
                    $scope.show_team = !$scope.show_team;
                };

                /**
                 * Tasks ui.sortable drag & drop config
                 */
                $scope.draggable = {
                    stop: function(e, ui){
                        var tasks = [];
                        angular.extend(tasks, $scope.tasks);
                        var i = 0,
                            max = tasks.length;
                        for(; i < max; i += 1){
                            tasks[i]['priority'] = i + 1;
                            Tasks.save(tasks[i]);
                        }
                        $scope.tasks.length = 0;
                        angular.extend($scope.tasks, tasks);
                    }
                };

                 /**
                 *  Add new task
                 */
                this.add = function(){
                    $scope.new_task.priority  = $scope.tasks.length + 1;
                    $scope.new_task.owner  = that.current_user;
                    $scope.new_task.assigned_to  = [that.current_user];
                    $scope.new_task.due_to = new Date($scope.new_task.due_to);
                    var pushed = $scope.tasks.push($scope.new_task);
                    Tasks.save($scope.new_task).success(function(data){
                        pushed -= 1;
                        if($scope.tasks[pushed]) {
                            $scope.tasks[pushed]['id'] = data.id;
                        }
                    });
                    $scope.new_task = {};
                };

                /**
                 *  Remove current task
                 *  @param task
                 */
                this.remove = function(task){
                    if(task.id) {
                        $scope.tasks.splice($scope.tasks.indexOf(task), 1);
                        Tasks.remove(task.id);
                    }
                };

                /**
                 * Save item changes
                 * @param task
                 */
                this.edit = function(task){
                    Tasks.save(task);
                };

                var that = this;

                // Listen for tasks changes with pusher
                var client = new Pusher('e749c59b174735416abe');
                var pusher = $pusher(client);
                var tasks_channel = pusher.subscribe('tasks-channel');
                tasks_channel.bind('tasks-changed', function(data) {
                    if(data.task.due_to){
                        data.task.due_to = new Date(data.task.due_to);
                    }
                    var i = 0,
                        max = $scope.tasks.length;
                    switch(data.method){

                        case 'save':
                            var saved = false;
                            for( ; i < max; i += 1) {
                                if (data.task.id == $scope.tasks[i]['id']) {
                                    $scope.tasks[i] = data.task;
                                    saved = true;
                                    break;
                                }
                            }
                            if(!saved){
                                var found = $filter("filter")($scope.tasks, {text: data.task.text}, true);
                                //Show new tasks only for assigned users
                                if(found.length == 0) {
                                    var check_permission = $filter("filter")(data.task.assigned_to, {id: that.current_user.id }, true);
                                    if(check_permission.length > 0) {
                                        $scope.tasks.push(data.task);
                                    }
                                }
                            }

                            break;
                        case 'delete':
                            for( ; i < max; i += 1) {
                                if (data.task.id == $scope.tasks[i]['id']) {
                                    $scope.tasks.splice(i, 1);
                                    break;
                                }
                            }
                        default:
                            ;
                    }
                });

                /**
                 * Fetch current_user
                 */
                $http.get('/current_user/').success(function(data){
                    that.current_user = data[0]['fields'];
                    that.current_user.id = data[0]['pk'];

                    // Filter tasks by current
                    Tasks.getAll(data[0]['pk']).then(function(response) {
                        $scope.tasks = response.data.objects;
                    });

                    // Fetch team
                    Teams.get(data[0]['pk']).then(function(response) {
                        $scope.team = response.data.objects[0];
                        if($scope.team && $scope.team.id) {
                            Teammates.getAll($scope.team.id).then(function (response) {
                                $scope.teammates = response.data.objects;
                            })
                        }
                    });

                });

                /**
                 * Add task by Ctrl + Enter
                 */

                $scope.down = function(e){
                    if(e.ctrlKey && e.keyCode == 13){
                        that.add();
                    }
                };

            },
            controllerAs: 'task_item'
        };
    });

})();
