/*
 * Copyright (C) 2018, 2019 StApps
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

// tslint:disable:completed-docs

/**
 * Scope of membership
 */
export enum MembershipScope {
  GROUPS = 'groups',
  PROJECTS = 'projects',
}

/**
 * Scope
 */
export enum Scope {
  ISSUES = 'issues',
  MERGE_REQUESTS = 'merge_requests',
}

/**
 * Merge request state
 */
export enum MergeRequestState {
  CLOSED = 'closed',
  LOCKED = 'locked',
  MERGED = 'merged',
  OPENED = 'opened',
}

/**
 * Issue state
 */
export enum IssueState {
  CLOSED = 'closed',
  OPENED = 'opened',
  REOPENED = 'reopened',
}

/**
 * Milestone state
 */
export enum MilestoneState {
  ACTIVE = 'active',
  CLOSED = 'closed',
}

/**
 * User state
 */
export enum UserState {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
}

/**
 * Merge request merge status
 */
export enum MergeRequestMergeStatus {
  CAN_BE_MERGED = 'can_be_merged',
}

/**
 * A note type
 */
export enum NoteType {
  DIFF_NOTE = 'DiffNote',
}

/**
 * A type of a noteable thing
 */
export enum NoteableType {
  MERGE_REQUST = 'MergeRequest',
}

/**
 * A label
 */
export interface Label {
  color: string;
  description?: string;
  name: string;
}

/**
 * A commit
 */
export interface Commit {
  author_email: string;
  author_name: string;
  authored_date: string;
  committed_date: string;
  committer_email: string;
  committer_name: string;
  id: string;
  message: string;
  parent_ids: string[];
}

/**
 * A tag
 */
export interface Tag {
  commit: Commit;
  message: string | null;
  name: string;
  release: null;
}

/**
 * A namespace
 */
export interface Namespace {
  full_path: string;
  id: number;
  kind: string;
  name: string;
  path: string;
}

/**
 * A project
 */
export interface Project {
  archived: boolean;
  avatar_url: string;
  container_registry_enabled: boolean;
  created_at: string;
  creator_id: number;
  default_branch: string;
  description: string;
  forks_count: number;
  http_url_to_repo: string;
  id: number;
  issues_enabled: boolean;
  jobs_enabled: boolean;
  last_activity_at: string;
  lfs_enabled: boolean;
  merge_requests_enabled: boolean;
  name: string;
  name_with_namespace: string;
  namespace: Namespace;
  only_allow_merge_if_all_discussions_are_resolved: boolean;
  only_allow_merge_if_pipeline_succeeds: boolean;
  open_issues_count: number;
  path: string;
  path_with_namespace: string;
  public_jobs: boolean;
  request_access_enabled: boolean;
  shared_runners_enabled: boolean;
  shared_with_groups: unknown[];
  snippets_enabled: boolean;
  ssh_url_to_repo: string;
  star_count: number;
  tag_list: string[];
  visibility: string;
  web_url: string;
  wiki_enabled: boolean;
}

/**
 * A tree file
 */
export interface TreeFile {
  id: string;
  mode: string;
  name: string;
  path: string;
  type: string;
}

/**
 * A member of a group or a project
 */
export interface Member extends User {
  access_level: AccessLevel;
  expires_at: string;
}

/**
 * Available access levels
 */
export enum AccessLevel {
  Guest = 10,
  Reporter = 20,
  Developer = 30,
  Maintainer = 40,
  Owner = 50,
}

/**
 * A milestone
 */
export interface Milestone {
  created_at: string;
  description: string | null;
  due_date: string;
  id: number;
  iid: number;
  project_id: number;
  start_date: string;
  state: MilestoneState;
  title: string;
  updated_at: string;
}

/**
 * A branch
 */
export interface Branch {
  commit: Commit;
  developers_can_merge: boolean;
  developers_can_push: boolean;
  merged: boolean;
  name: string;
  protected: boolean;
}

/**
 * A user
 */
export interface User {
  avatar_url: string;
  id: number;
  name: string;
  state: UserState;
  username: string;
  web_url: string;
}

/**
 * A issue
 */
export interface Issue extends ThingWithTimeStats {
  assignee: User;
  assignees: User[];
  author: User;
  closed_at: string | null;
  confidential: boolean;
  created_at: string;
  description: string | null;
  discussion_locked: boolean | null;
  downvotes: number;
  due_date: string | null;
  id: number;
  iid: number;
  labels: string[];
  milestone: Milestone | null;
  project_id: number;
  state: IssueState;
  title: string;
  updated_at: string;
  upvotes: number;
  user_notes_count: number;
  web_url: string;
}

/**
 * A merge request
 */
export interface MergeRequest extends ThingWithTimeStats {
  assignee: User;
  author: User;
  created_at: string;
  description: string | null;
  discussion_locked: boolean | null;
  downvotes: number;
  force_remove_source_branch: boolean;
  id: number;
  iid: number;
  labels: Label[];
  merge_commit_sha: string;
  merge_status: MergeRequestMergeStatus;
  merge_when_pipeline_succeeds: boolean;
  milestone: Milestone;
  project_id: number;
  sha: string;
  should_remove_source_branch: boolean;
  source_branch: string;
  source_project_id: number;
  state: MergeRequestState;
  target_branch: string;
  target_project_id: number;
  title: string;
  updated_at: string;
  upvotes: number;
  user_notes_count: number;
  web_url: string;
  work_in_progress: boolean;
}

/**
 * A merge request approval
 */
export interface MergeRequestApproval {
  approvals_left: number;
  approvals_required: number;
  approved_by: Array<{ user: User; }>;
  approver_groups: Group[];
  approvers: User[];
  created_at: string;
  description: string;
  id: number;
  iid: number;
  merge_status: MergeRequestMergeStatus;
  project_id: number;
  state: MergeRequestState;
  title: string;
  updated_at: string;
}

/**
 * A thing with time stats
 */
export interface ThingWithTimeStats {
  time_stats: {
    human_time_estimate: number | null;
    human_total_time_spent: number | null;
    time_estimate: number;
    total_time_spent: number;
  };
}

/**
 * A group
 */
export interface Group {
  avatar_url: string;
  description: string;
  full_name: string;
  full_path: string;
  id: number;
  ldap_access: string;
  ldap_cn: string;
  lfs_enabled: boolean;
  name: string;
  parent_id: number;
  path: string;
  request_access_enabled: boolean;
  visibility: string;
  web_url: string;
}

/**
 * A discussion
 */
export interface Discussion {
  id: string;
  individual_note: boolean;
  notes: Note[];
}

/**
 * A note
 */
export interface Note {
  attachment: null;
  author: User;
  body: string;
  created_at: string;
  id: number;
  noteable_id: number;
  noteable_iid: number;
  noteable_type: NoteableType;
  position: {
    base_sha: string;
    head_sha: string;
    new_line: number | null;
    new_path: string;
    old_line: number | null;
    old_path: string;
    position_type: string;
    start_sha: string;
  };
  resolvable: boolean;
  resolved: boolean | undefined;
  resolved_by: User | undefined;
  system: boolean;
  type: NoteType;
  updated_at: string;
}
