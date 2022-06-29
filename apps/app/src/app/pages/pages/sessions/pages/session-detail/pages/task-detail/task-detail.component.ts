import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  BrowserTitleService,
  LanguageService,
} from '../../../../../../../core';

@Component({
  selector: 'app-pages-sessions-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss'],
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;

  constructor(
    private route: ActivatedRoute,
    private browserTitleService: BrowserTitleService,
    private languageService: LanguageService
  ) {
    this.browserTitleService.setTitle(
      this.languageService.instant(
        'pages.sessions.session-detail.task-detail.title'
      )
    );
  }

  ngOnInit() {
    this.route.data.subscribe((data) => {
      if (data['task']) {
        this.task = data['task'];
      }
    });
  }

  /**
   * Return the current task id from the route
   *
   * @returns Id for the task
   */
  get taskId(): string {
    return this.route.snapshot.paramMap.get('task') ?? '';
  }

  /**
   * Return the current session id from the route
   *
   * @returns Id for the session
   */
  get sessionId(): string {
    return this.route.snapshot.paramMap.get('session') ?? '';
  }

  /**
   * Return the current application name from the route
   *
   * @returns Name for the application
   */
  get applicationName(): string {
    return this.route.snapshot.paramMap.get('applicationName') ?? '';
  }

  /**
   * Return the current application version from the route
   *
   * @returns Version for the application
   */
  get applicationVersion(): string {
    return this.route.snapshot.paramMap.get('applicationVersion') ?? '';
  }
}