/*
 * Copyright (C) 2018-2020 StApps
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <https://www.gnu.org/licenses/>.
 */
import {
  AccessLevel,
  Branch,
  Discussion,
  Group,
  Issue,
  IssueState,
  Label,
  Member,
  MembershipScope,
  MergeRequest,
  MergeRequestApproval,
  MergeRequestState,
  Milestone,
  Note,
  Project,
  Scope,
  Tag,
  TreeFile,
  User,
} from './types';
import {ILoggerApi, ILogLevel} from '@allgemein/base';
import {HttpFactory, IHttp, IHttpOptions, IHttpResponse} from '@allgemein/http';
import {URL} from 'url';

function encodeRFC5987ValueChars(str: string) {
  return encodeURIComponent(str).replace(/['()]/g, escape). // i.e., %27 %28 %29
    replace(/\*/g, '%2A').replace(/%(?:7C|60|5E)/g, unescape);
}

/**
 * API request options
 */
export interface GitlabApiRequestOptions {
  /**
   * Data to be sent with the request
   */
  data?: object | null;

  /**
   * HTTP verb to use for the request
   */
  method?: 'DELETE' | 'GET' | 'POST' | 'PUT';

  /**
   * Whether or not to retry on any error
   */
  retryOnAnyError?: boolean;

  /**
   * Amount of tries
   */
  tries?: number;
}

/**
 * GitLab API get issues options
 */
export interface GitlabApiGetIssuesOptions {
  /**
   * Filter issues by group ID
   */
  groupId?: number;
  /**
   * Filter issues by milestone
   */
  milestone?: 'Backlog' | 'No Milestone';
  /**
   * Filter issues by state
   */
  state?: IssueState;
}

/**
 * GitLab API
 */
export class GitlabApi {
  /**
   * Private token
   */
  private readonly privateToken: string;

  /**
   * Root url
   */
  private readonly rootUrl: string;

  /**
   * Http client library
   *
   * @private
   */
  private readonly http: IHttp;

  private readonly apiPrefix = 'api/v4/';

  /**
   * Logger
   *
   * @private
   */
  private readonly logger: ILoggerApi = {
    log(level: number | string, ...msg) {
    },
    trace(...msg) {
    },
    debug(...msg) {
    },
    error(...msg) {
    },
    info(...msg) {
    },
    getLevel(): ILogLevel {
      return null;
    },
    isEnabled(set?: boolean): boolean {
      return false;
    },
    warn(...msg) {
    },
    setLevel(level: number | string) {
    }
  };


  /**
   * Instantiate new GitLab API
   *
   * @param rootUrl Root URL of the GitLab API
   * @param privateToken Private token for the GitLab API
   */
  constructor(rootUrl: string, privateToken: string, logger?: ILoggerApi) {
    const url = new URL(rootUrl);
    this.rootUrl = url.toString();
    if (!/\/api\//.test(this.rootUrl)) {
      this.rootUrl = this.rootUrl + this.apiPrefix;
    }

    this.privateToken = privateToken;
    this.http = HttpFactory.create();
    this.logger = logger ? logger : this.logger;
  }


  /**
   * List all projects
   */
  getProjects() {
    return this.makeGitLabAPIRequest(
      `projects`
    ) as Promise<Project[]>;
  }

  /**
   * Get single project data
   */
  getProject(id_or_name: string | number) {
    const d = this.decode(id_or_name);
    return this.makeGitLabAPIRequest(
      `projects/${d}`
    ) as Promise<Project>;
  }

  /**
   * List user projects
   */
  getProjectsForUser(user_id: string | number) {
    return this.makeGitLabAPIRequest(
      `users/${this.decode(user_id)}/projects`
    ) as Promise<Project[]>;
  }

  /**
   * Get projects for a group
   *
   * @param groupId Group ID to get projects for
   */
  getProjectsForGroup(groupId: number | string): Promise<Project[]> {
    return this.makeGitLabAPIRequest(
      `groups/${this.decode(groupId)}/projects`
    ) as Promise<Project[]>;
  }


  /**
   * Get single project data
   */
  getProjectUsers(id_or_name: string | number) {
    return this.makeGitLabAPIRequest(
      `projects/${this.decode(id_or_name)}/users`
    ) as Promise<User[]>;
  }

  /**
   * Add member to a group or a project
   *
   * @param scope MembershipScope of the ID
   * @param id ID of the group or project
   * @param userId ID of the user
   * @param accessLevel Access level for the new member in the scope
   */
  public addMember(scope: MembershipScope,
                   id: number,
                   userId: number,
                   accessLevel: AccessLevel): Promise<Member> {
    return this.makeGitLabAPIRequest(
      `${scope}/${id}/members`,
      {
        data: {
          access_level: accessLevel,
          user_id: userId,
        },
        method: 'POST',
      },
    ) as Promise<Member>;
  }

  /**
   * Create an issue in GitLab
   *
   * @param projectId ID of the project to create the issue in
   * @param title Title of the issue
   * @param description Description of the issue (can contain slash commands)
   */
  public createIssue(projectId: number, title: string, description: string): Promise<Issue> {
    return this.makeGitLabAPIRequest(
      `projects/${projectId}/issues`,
      {
        data: {
          description: description,
          title: title,
        },
        method: 'POST',
      },
    ) as Promise<Issue>;
  }

  /**
   * Create a new label
   *
   * @param projectId ID of the project to create the label in
   * @param name Name of the label to create
   * @param description Description of the label to create
   * @param color Color of the label to create
   */
  public createLabel(projectId: number, name: string, description?: string, color?: string): Promise<Label> {
    let _color = '#000000';
    if (typeof color !== 'string' || !/^#[0-9a-fA-F]{3,6}$/.test(color)) {
      _color = '#000000';
    }

    return this.makeGitLabAPIRequest(
      `projects/${projectId}/labels`,
      {
        data: {
          color: _color,
          description,
          name,
        },
        method: 'POST',
      },
    ) as Promise<Label>;
  }

  /**
   * Create a milestone in a project
   *
   * @param projectId Project ID to create milestone in
   * @param title Title of the milestone to create
   */
  public createMilestone(projectId: number, title: string): Promise<void> {
    return this.makeGitLabAPIRequest(`projects/${projectId}/milestones?title=${title}`, {
      method: 'POST',
    }) as Promise<void>;
  }

  /**
   * Create a note (comment) in an issue/merge request
   *
   * @param projectId Project ID, the issue belongs to
   * @param scope Scope of the note
   * @param iid IID of the issue/merge request to create the note in
   * @param body Body of the note to create
   */
  public createNote(projectId: number, scope: Scope, iid: number, body: string): Promise<void> {
    return this.makeGitLabAPIRequest(
      `projects/${projectId}/${scope}/${iid}/notes`,
      {
        data: {
          body,
        },
        method: 'POST',
      },
    ) as Promise<void>;
  }

  /**
   * Delete a label
   *
   * @param projectId ID of the project to delete the label from
   * @param name Name of the label to delete
   */
  public deleteLabel(projectId: number, name: string): Promise<void> {
    return this.makeGitLabAPIRequest(
      `projects/${projectId}/labels?name=${name}`,
      {
        method: 'DELETE',
      },
    ) as Promise<void>;
  }

  /**
   * Delete a member from a group or a project
   *
   * @param scope MembershipScope of the ID
   * @param id ID of the group or project
   * @param userId ID of the user
   */
  public async deleteMember(scope: MembershipScope, id: number, userId: number): Promise<void> {
    return this.makeGitLabAPIRequest(`${scope}/${id}/members/${userId}`, {method: 'DELETE'}) as Promise<void>;
  }

  /**
   * Edit an existing label
   *
   * @param projectId ID of the project to edit the label in
   * @param name Name of the label to edit
   * @param newValues New values for the label
   */
  public async editLabel(projectId: number, name: string, newValues: Partial<Label>): Promise<Label> {
    if (typeof newValues.color === 'string' && !/^#[0-9a-fA-F]{3,6}$/.test(newValues.color)) {
      newValues.color = undefined;
    }

    return this.makeGitLabAPIRequest(
      `projects/${projectId}/labels`,
      {
        data: {
          color: newValues.color,
          description: newValues.description,
          name: name,
          new_name: newValues.name,
        },
        method: 'POST',
      },
    ) as Promise<Label>;
  }

  /**
   * Edit member in a group or a project
   *
   * @param scope MembershipScope of the ID
   * @param id ID of the group or project
   * @param userId ID of the user
   * @param accessLevel Access level for the member in the scope
   */
  public editMember(scope: MembershipScope,
                    id: number,
                    userId: number,
                    accessLevel: AccessLevel): Promise<Member> {
    return this.makeGitLabAPIRequest(
      `${scope}/${id}/members`,
      {
        data: {
          access_level: accessLevel,
          user_id: userId,
        },
        method: 'PUT',
      },
    ) as Promise<Member>;
  }

  /**
   * Get branches for a project
   *
   * @param projectId Project ID to get branches for
   */
  public getBranchesForProject(projectId: number): Promise<Branch[]> {
    return this.makeGitLabAPIRequest(`projects/${projectId}/repository/branches`) as Promise<Branch[]>;
  }

  /**
   * Get a file from GitLab
   *
   * @param projectId ID of the project the file belongs to
   * @param filePath Path to the file - url encoded
   * @param commitish Commitish of the file
   */
  public getFile(projectId: number, filePath: string, commitish: string): Promise<unknown> {
    const fileIdentifier = `${encodeURIComponent(filePath)
      .replace('.', '%2E')}/raw?ref=${encodeURIComponent(commitish)}`;

    return this.makeGitLabAPIRequest(`projects/${projectId}/repository/files/${fileIdentifier}`) as Promise<unknown>;
  }

  /**
   * Get a list of files
   *
   * @param projectId ID of the project
   */
  public getFileList(projectId: number): Promise<TreeFile[]> {
    return this.makeGitLabAPIRequest(`projects/${projectId}/repository/tree`) as Promise<TreeFile[]>;
  }

  /**
   * Get issues
   *
   * @param options Options to get issues
   */
  public getIssues(options: GitlabApiGetIssuesOptions = {}): Promise<Issue[]> {
    // start to build request url
    let requestUrl = 'issues';

    // set initial divider for filter params
    let divider = '?';

    // request issues only for specific group, if group ID is set
    if (typeof options.groupId === 'number') {
      requestUrl = `groups/${options.groupId}/${requestUrl}`;
    }

    if (typeof options.milestone === 'string') {
      // add milestone to request url
      requestUrl += `${divider}milestone=${options.milestone}`;
      divider = '&';
    }

    // request issues only for specific state, if state is set
    if (typeof options.state === 'string') {
      requestUrl += `${divider}state=${options.state}`;
      // divider = '&';
    }

    return this.makeGitLabAPIRequest(requestUrl) as Promise<Issue[]>;
  }

  /**
   * Get labels of a project
   *
   * @param projectId ID of the project to get the labels for
   */
  public getLabels(projectId: number): Promise<Label[]> {
    return this.makeGitLabAPIRequest(`projects/${projectId}/labels`) as Promise<Label[]>;
  }

  /**
   * Get members of a group or a project
   *
   * @param scope MembershipScope of the ID
   * @param id ID of the group or project
   */
  public getMembers(scope: MembershipScope, id: number): Promise<Member[]> {
    return this.makeGitLabAPIRequest(`${scope}/${id}/members`) as Promise<Member[]>;
  }

  /**
   * Get a merge request approval
   *
   * @param projectId ID of the project the merge request belongs to
   * @param mergeRequestIid IID of the merge request
   */
  public getMergeRequestApproval(projectId: number, mergeRequestIid: number): Promise<MergeRequestApproval> {
    return this.makeGitLabAPIRequest(`/projects/${projectId}/merge_requests/${mergeRequestIid}/approvals`) as
      Promise<MergeRequestApproval>;
  }

  /**
   * Get discussions of a merge request
   *
   * @param projectId ID of the project the merge request belongs to
   * @param mergeRequestIid IID of the merge request
   */
  public getMergeRequestDiscussions(projectId: number, mergeRequestIid: number): Promise<Discussion[]> {
    return this.makeGitLabAPIRequest(
      `projects/${projectId}/merge_requests/${mergeRequestIid}/discussions`,
    ) as Promise<Discussion[]>;
  }

  /**
   * Get merge requests of a group or a project
   *
   * @param scope MembershipScope of the ID
   * @param id ID of the group or project
   * @param state State to filter the merge requests by
   */
  public getMergeRequests(scope: MembershipScope,
                          id: number,
                          state: MergeRequestState | MergeRequestState[]): Promise<MergeRequest[]> {
    let _state = state;

    // join a list of states with commas
    if (Array.isArray(state)) {
      _state = state.join(',') as MergeRequestState;
    }

    return this.makeGitLabAPIRequest(`${scope}/${id}/merge_requests?state=${_state}`) as Promise<MergeRequest[]>;
  }

  /**
   * Get milestones for a project
   *
   * @param projectId Project ID to get milestones for
   */
  public getMilestonesForProject(projectId: number): Promise<Milestone[]> {
    return this.makeGitLabAPIRequest(`projects/${projectId}/milestones`) as Promise<Milestone[]>;
  }

  /**
   * Get notes for issue
   *
   * @param projectId Project ID of issue to get notes for
   * @param issue Issue to get notes for
   */
  public getNotes(projectId: number, issue: Issue) {
    return this.makeGitLabAPIRequest(`/projects/${projectId}/issues/${issue.iid}/notes?sort=asc`) as Promise<Note[]>;
  }


  /**
   * Get sub groups of a group
   *
   * @param groupId Group ID to get subgroups for
   */
  public getSubGroupsForGroup(groupId: number): Promise<Group[]> {
    return this.makeGitLabAPIRequest(`groups/${groupId}/subgroups`) as Promise<Group[]>;
  }

  /**
   * Get tags of a project
   *
   * @param projectId ID of the project to get the tags for
   */
  public getTags(projectId: number): Promise<Tag[]> {
    return this.makeGitLabAPIRequest(
      `projects/${projectId}/repository/tags`,
    ) as Promise<Tag[]>;
  }

  /**
   * Query a GitLab API URL
   *
   * @param url GitLab API URL to query
   * @param options HTTP method/verb
   */
  public async makeGitLabAPIRequest(url: string, options?: GitlabApiRequestOptions): Promise<unknown> {
    // remove leading slash
    const _url = url.replace(/^\/+/g, '');

    const _options: Required<GitlabApiRequestOptions> = {
      data: null,
      method: 'GET',
      retryOnAnyError: false,
      tries: 5,
      ...options,
    };

    if (!['DELETE', 'GET', 'POST', 'PUT'].includes(_options.method)) {
      _options.method = 'GET';
    }

    let concatenator = '&';
    if (_url.indexOf('?') === -1) {
      concatenator = '?';
    }

    let apiResult: unknown;
    let totalPages = 1;
    let currentPage = 0;

    while (++currentPage <= totalPages) {
      if (currentPage > 1) {
        this.logger.info(`Automatically paging call to '${_url}'... Getting page ${currentPage} of ${totalPages}.`);
      }

      let body;
      const method = _options.method.toLowerCase();
      const requestUrl = `${_url}${concatenator}page=${currentPage}&per_page=100`;
      const reqOptions: IHttpOptions & any = {
        headers: {'PRIVATE-TOKEN': this.privateToken},
        responseType: 'json',
        passBody: true,
        timeout: 60000,
        retry: 5,
        followRedirect: true,
        hooks: {
          afterResponse: [
            (response: IHttpResponse<any>) => {
              const xTotalPages = response.headers['x-total-pages'];
              if (typeof xTotalPages === 'string') {
                totalPages = parseInt(xTotalPages, 10);
              }
              return response;
            }
          ]
        }
      };

      if (_options.data !== null) {
        reqOptions.form = _options.data;
      }

      // try {
      body = await this.http[method](`${this.rootUrl}${requestUrl}`, reqOptions);
      // } catch (e) {

      // }


      // body = await request(`${this.rootUrl}${requestUrl}`, {
      //   form: _options.data !== null ? _options.data : undefined,
      //   headers: {'PRIVATE-TOKEN': this.privateToken},
      //   json: true,
      //   method: _options.method,
      //   timeout: 60000,
      //   followAllRedirects: true,
      //   transform: (bodyToTransform, response) => {
      //     const xTotalPages = response.headers['x-total-pages'];
      //
      //     if (typeof xTotalPages === 'string') {
      //       totalPages = parseInt(xTotalPages, 10);
      //     }
      //
      //     return bodyToTransform;
      //   },
      // });
      // }

      if (_options.method === 'DELETE') {
        return;
      }

      if (typeof apiResult !== 'undefined' && Array.isArray(apiResult) && currentPage > 1) {
        // add items to previously fetched items
        apiResult = apiResult.concat(body);
      } else {
        // set (initial) result
        apiResult = body;
      }
    }

    return apiResult;
  }

  private decode(id: string | number) {
    if (typeof id === 'string') {
      return encodeRFC5987ValueChars(id);
    }
    return id;
  }

  /**
   * Protect a branch
   *
   * @param projectId ID of the project the branch belongs to
   * @param branch Branch to protect
   */
  public protectBranch(projectId: number, branch: string): Promise<Branch> {
    return this.makeGitLabAPIRequest(
      /* tslint:disable-next-line:max-line-length */
      `projects/${projectId}/repository/branches/${branch}/protect?developers_can_push=false&developers_can_merge=false`,
      {
        method: 'PUT',
      },
    ) as Promise<Branch>;
  }

  /**
   * Set assignee for an issue
   *
   * @param issue Issue to set assignee for
   * @param userId ID of the assignee to set for the issue
   */
  public setAssigneeForIssue(issue: Issue, userId: number): Promise<Issue> {
    return this.makeGitLabAPIRequest(
      `projects/${issue.project_id}/issues/${issue.iid}?assignee_ids=${userId}`,
      {
        method: 'PUT',
      },
    ) as Promise<Issue>;
  }

  /**
   * Set assignee for an merge request
   *
   * @param mergeRequest Merge request to set assignee for
   * @param userId ID of the assignee to set for the merge request
   */
  public setAssigneeForMergeRequest(mergeRequest: MergeRequest, userId: number): Promise<MergeRequest> {
    return this.makeGitLabAPIRequest(
      `projects/${mergeRequest.project_id}/merge_requests/${mergeRequest.iid}?assignee_ids=${userId}`,
      {
        method: 'PUT',
      },
    ) as Promise<MergeRequest>;
  }

  /**
   * Set milestone for an issue
   *
   * @param issue Issue to set milestone for
   * @param milestoneId ID of the milestone to set for the issue
   */
  public setMilestoneForIssue(issue: Issue, milestoneId: number): Promise<Issue> {
    if (milestoneId === null) {
      return this.makeGitLabAPIRequest(
        `projects/${issue.project_id}/issues/${issue.iid}?milestone_id=`,
        {
          method: 'PUT',
        },
      ) as Promise<Issue>;
    }

    return this.makeGitLabAPIRequest(
      `projects/${issue.project_id}/issues/${issue.iid}?milestone_id=${milestoneId}`,
      {
        method: 'PUT',
      },
    ) as Promise<Issue>;
  }
}


