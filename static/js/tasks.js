/**
 * Created by njuice on 08.09.15.
 */
(function(){
    var app = angular.module('tasks', ["ngCookies", "ngResource", "pusher-angular", "ui.sortable", "ui.bootstrap", "cgNotify"]);
    app.directive('tasksManagement', function(){
        return {
            restrict: 'E',
            templateUrl: '/static/html/tasks_manager.html',
            controller: function($log, $scope){
                $scope.tasks = [
                    {completed:false, text: 'task1', due_to: new Date('2015-09-08'), assigned_to:{first_name:'Fname', last_name: 'Lname'}},
                    {completed:false, text: 'task2', due_to: new Date('2015-09-08'), assigned_to:{first_name:'Fname1', last_name: 'Lname2'}}
                ];
            },
            controllerAs: 'task_item'
        };
    });
})();