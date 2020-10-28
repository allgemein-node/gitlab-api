import {suite, test, timeout} from '@testdeck/mocha';
import {expect} from 'chai';
import {GitlabApi} from '../../src/lib/GitlabApi';
import {Logger} from '@allgemein/base';

const PERSONAL_PROJECT_ACCESS_TOKEN = 'pp8WreXi_mBsLUC6vmKh';
const USER_TEST_ACCESS_TOKEN = 'Nx78xRzzLMKxBVmYnhzr';
const ROOT_URL = 'http://127.0.0.1:8929';
let api: GitlabApi = null;

/**
 * TODO
 */
@suite('functional/gitlab_api') @timeout(30000)
class GitlabApiSpec {


  static async before() {
    api = new GitlabApi(ROOT_URL, USER_TEST_ACCESS_TOKEN, Logger.getLogger());
  }


  /**
   * Get projects list
   */
  @test
  async 'get projects'() {
    const projects = await api.getProjects();
    expect(projects).to.have.length.gte(1);
    const p = projects.find(x => x.name === 'personal-project');
    expect(p).to.deep.include({
      id: 2,
      description: '',
      name: 'personal-project',
      name_with_namespace: 'test / personal-project',
      path: 'personal-project',
    });
  }


  /**
   * Get project by id
   */
  @test
  async 'get project by id'() {
    let project = await api.getProject(2);
    expect(project).to.deep.include({
      id: 2,
      description: '',
      name: 'personal-project',
      name_with_namespace: 'test / personal-project',
      path: 'personal-project',
    });
    project = await api.getProject('test/personal-project');
    expect(project).to.deep.include({
      id: 2,
      description: '',
      name: 'personal-project',
      name_with_namespace: 'test / personal-project',
      path: 'personal-project',
    });
  }


  /**
   * Get project for users
   */
  @test
  async 'get projects for user'() {
    const projects = await api.getProjectsForUser('test');
    const project = projects.find(x => x.id === 2);
    expect(project).to.deep.include({
      id: 2,
      description: '',
      name: 'personal-project',
      name_with_namespace: 'test / personal-project',
      path: 'personal-project',
    });
  }

  /**
   * Get project for users
   */
  @test
  async 'get projects by group'() {
    let projects = await api.getProjectsForGroup(5);
    let project = projects.find(x => x.id === 3);
    expect(project).to.deep.include({
      id: 3,
      description: '',
      name: 'grouped-project',
      name_with_namespace: 'testgroup / grouped-project',
      path: 'grouped-project',
    });
    projects = await api.getProjectsForGroup('testgroup');
    project = projects.find(x => x.id === 3);
    expect(project).to.deep.include({
      id: 3,
      description: '',
      name: 'grouped-project',
      name_with_namespace: 'testgroup / grouped-project',
      path: 'grouped-project',
    });
  }


  /**
   * Get users of project
   */
  @test
  async 'get users of project'() {
    const users = await api.getProjectUsers(2);
    const user = users.find(x => x.username === 'test');
    expect(user).to.deep.include({
      id: 2,
      username: 'test',
    });
  }
}


