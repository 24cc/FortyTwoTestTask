/**
 * Created by njuice on 26.07.15.
 */
'use strict';

describe('Tasks Management directive', function() {
    var $scope;
    var scope, controller, $httpBackend, Tasks;

    beforeEach(module('tasks'));
    beforeEach(module('my.templates'));

    beforeEach(inject(function($compile, $rootScope, _$httpBackend_, _Tasks_) {
        $scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        Tasks = _Tasks_;
        $httpBackend.expectGET('/current_user/').respond(200, [{'fields': {'username' : "Bogdan Piven"}}]);
        $httpBackend.expectGET('/api/v1/items/?format=json').respond(200, {});
        var element = angular.element("<tasks-management></tasks-management>");
        $compile(element)($scope);
        $scope.$digest();
        controller = element.controller();
        scope = element.isolateScope() || element.scope();
    }));


    it('should display empty new task form', function(){
        expect(scope.new_task).toEqual({})
    });

    it('should fetch tasks items', function(){
        var tasks;
        $httpBackend.expectGET('/api/v1/items/?format=json').respond([{text: 'task1', owner:{id: 1, name: 'User'}, due_to: '2015-07-31', completed: false}]);
        Tasks.getAll().then(function(returnFromPromise){
            tasks = returnFromPromise.data;
        });
        $scope.$apply();
        $httpBackend.flush();
        expect(tasks).toEqual([{text: 'task1', owner:{id: 1, name: 'User'}, due_to: '2015-07-31', completed: false}]);
    });

});



