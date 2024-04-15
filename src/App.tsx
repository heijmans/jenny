import classNames from 'classnames';
import { ReactNode } from 'react';
import { Link, Route, Switch, useLocation } from 'wouter';
import JobView from './JobView';
import { JobDetails, JobSummary } from './model';
import { duc, useGet, ShowStatus, JenkinsIcon } from './utils';

function JobsView({ orgName, repoName }: { orgName: string, repoName: string }): ReactNode {
  const status = useGet<JobDetails>(`/backend/job/${orgName}/job/${repoName}/api/json`);
  const [, setLocation] = useLocation();
  const showJob = (job: JobSummary) => setLocation(`/orgs/${orgName}/repos/${repoName}/jobs/${job.name}`);

  const repo = status.data;
  if (!repo) { return <ShowStatus status={status} />; }

  const jobs = repo.jobs; // .filter(x => x._class === 'org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject');

  return <div>
    <h2>{repoName} <JenkinsIcon url={`/job/${orgName}/job/${repoName}/`} /></h2>
    <table className="active-table">
      <tbody>
        {jobs.map((job) =>
          <tr key={job.name} className={`job-color-${job.color} active-row`} onClick={() => showJob(job)}>
            <td>{duc(job.name)}</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>;
}

function ReposView({ orgName, repoName }: { orgName: string, repoName?: string }): ReactNode {
  const status = useGet<JobDetails>(`/backend/job/${orgName}/api/json`);
  const [, setLocation] = useLocation();
  const showRepo = (repo: JobSummary) => setLocation(`/orgs/${orgName}/repos/${repo.name}`);

  const org = status.data;
  if (!org) { return <ShowStatus status={status} />; }

  const repos = org.jobs.filter(x => x._class === 'org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject');

  return <div>
    <h2>{orgName} <JenkinsIcon url={`/job/${orgName}/`} /></h2>
    <table className="active-table">
      <tbody>
        {repos.map((repo) =>
          <tr
            key={repo.name}
            className={classNames({ [`job-color-${repo.color}`]: true, 'active-row': true, 'selected-row': repo.name === repoName })}
            onClick={() => showRepo(repo)}
          >
            <td>{duc(repo.name)}</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>;
}

function OrgTable({ orgs, orgName }: { orgs: JobSummary[], orgName?: string }): ReactNode {
  const [, setLocation] = useLocation();
  const showOrg = (org: JobSummary) => setLocation(`/orgs/${org.name}`);
  return <table className="active-table">
    <tbody>
      {orgs.map((org) =>
        <tr
          key={org.name}
          className={classNames({ [`job-color-${org.color}`]: true, 'active-row': true, 'selected-row': org.name === orgName })}
          onClick={() => showOrg(org)}
        >
          <td>{duc(org.name)}</td>
        </tr>
      )}
    </tbody>
  </table>;
}

function MainView({ orgName, repoName }: { orgName?: string, repoName?: string }): ReactNode {
  const status = useGet<JobDetails>(`/backend/api/json`);
  const main = status.data;
  if (!main) { return <ShowStatus status={status} />; }

  const orgs = main.jobs.filter(x => x._class === 'jenkins.branch.OrganizationFolder');

  return (
    <div className='split split112'>
      <div>
        <p><Link href='/'>Start</Link></p>
        <OrgTable orgs={orgs} orgName={orgName} />
      </div>
      <div>
        {orgName && <ReposView orgName={orgName} repoName={repoName} />}
      </div>
      <div>
        {orgName && repoName && <JobsView orgName={orgName} repoName={repoName} />}
      </div>
    </div>
  );
}

export default function App(): ReactNode {
  return <Switch>
    <Route path="/">
      {() => <MainView />}
    </Route>
    <Route path="/orgs/:orgName">
      {({ orgName }) => <MainView orgName={orgName} />}
    </Route>
    <Route path="/orgs/:orgName/repos/:repoName">
      {({ orgName, repoName }) => <MainView orgName={orgName} repoName={repoName} />}
    </Route>

    <Route path="/orgs/:orgName/repos/:repoName/jobs/:jobName">
      {({ orgName, repoName, jobName }) => <JobView jobSpec={{ orgName, repoName, jobName }} />}
    </Route>

    <Route path="/orgs/:orgName/repos/:repoName/jobs/:jobName/runs/:runId">
      {({ orgName, repoName, jobName, runId }) => <JobView jobSpec={{ orgName, repoName, jobName }} runId={runId} />}
    </Route>

    <Route path="/orgs/:orgName/repos/:repoName/jobs/:jobName/runs/:runId/errors/:errorIdx">
      {({ orgName, repoName, jobName, runId, errorIdx }) => <JobView jobSpec={{ orgName, repoName, jobName }} runId={runId} errorIdx={parseInt(errorIdx)} />}
    </Route>

    <Route>
      <p><Link href='/'>Start</Link></p>
      <h2>404: No such page!</h2>
    </Route>
  </Switch>;
}
