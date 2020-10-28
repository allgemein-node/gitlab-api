import {suite, test, timeout} from '@testdeck/mocha';
import {expect} from 'chai';
import {GitlabApi} from '../../src/lib/GitlabApi';
import {Logger} from '@allgemein/base';
import {HttpFactory} from '@allgemein/http';

const PROJECT_ACCESS_TOKEN = 'pp8WreXi_mBsLUC6vmKh';
const ROOT_URL = 'http://localhost:8929';
HttpFactory.load();

/**
 * TODO
 */
@suite('functional/gitlab_api') @timeout(30000)
class GitlabApiSpec {


  static async before() {
  }

  /**
   * Get default adapter name
   */
  @test
  async 'get projects'() {
    const api = new GitlabApi(ROOT_URL, PROJECT_ACCESS_TOKEN, Logger.getLogger());
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


}


