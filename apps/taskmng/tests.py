from django.utils import unittest
from django.test.client import Client
from django.contrib.auth.models import User
from django.test import LiveServerTestCase
from selenium import webdriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from taskmng.models import Tasks
import datetime


'''
class TasksTests(LiveServerTestCase):

    def setUp(self):
        self.browser = webdriver.Firefox()
        self.browser.implicitly_wait(3)

        self.user = User.objects.create_user(username='test',
                                             password='test')
        self.user.is_superuser = True
        self.user.is_staff = True
        self.user.save()

    def tearDown(self):
        self.browser.quit()

    def test_tasks_page(self):
        """
           Add task item from ui
        """
        # Login via standard django auth
        self.browser.get(self.live_server_url + '/admin/')
        username_field = self.browser.find_element_by_name('username')
        username_field.send_keys('test')

        password_field = self.browser.find_element_by_name('password')
        password_field.send_keys('test')

        form = self.browser.find_element_by_tag_name('form')
        if form:
            form.submit()

        self.browser.get(self.live_server_url + "/tasks/")

        # Add new task item
        task_text_input = self.browser.find_element_by_id('textField')
        task_date_input = self.browser.find_element_by_id('dateField')
        task_add_button = self.browser.find_element_by_id('addButton')

        task_text_input.send_keys('My test task')
        task_date_input.send_keys(datetime.date.today().strftime('%Y-%m-%d'))
        task_add_button.click()

        try:
            element = WebDriverWait(self.browser, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "task"))
            )
        finally:
            pass

        self.assertEqual(self.browser.find_element_by_class_name('task'),
                         element)

'''


class TasksModelTests(unittest.TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='test2',
                                             password='test2')
        self.user.is_superuser = True
        self.user.save()

    def test_create_new_task_in_db(self):
        """
            Create new task item in db
        """
        task = Tasks()
        task.owner = self.user
        task.text = 'Test task'
        task.due_to = datetime.date.today()
        task.completed = False
        task.priority = 0
        task.save()

        all_tasks = Tasks.objects.all()
        self.assertEqual(len(all_tasks), 1)
        self.assertEqual(all_tasks[0], task)
