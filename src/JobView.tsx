import classNames from "classnames";
import { ReactNode, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Run, RunMeta, Stage, TestCase, TestReport } from "./model";
import { useGet, ShowStatus, duc, JenkinsIcon } from "./utils";

const dateForm = new Intl.DateTimeFormat(undefined, {
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
});
const timeForm = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
});
const timeFormSecs = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function toString2(x: number): string {
  return (x < 10 ? '0' : '') + x;
}

export function formatDuration(s: number): string {
  const h = Math.floor(s / 3600);
  s = s % 3600;
  const m = Math.floor(s / 60);
  s = s % 60;
  return toString2(h) + ":" + toString2(m) + ":" + toString2(s);
}

export interface JobSpec {
  orgName: string;
  repoName: string;
  jobName: string;
}

export function jobBEUrl({ orgName, repoName, jobName }: JobSpec): string {
  return `/backend/job/${orgName}/job/${repoName}/job/${jobName}`;
}

export function jobFEUrl({ orgName, repoName, jobName }: JobSpec): string {
  return `/orgs/${orgName}/repos/${repoName}/jobs/${jobName}`;
}

export function jobJenkinsUrl({ orgName, repoName, jobName }: JobSpec): string {
  return `/job/${orgName}/job/${repoName}/job/${jobName}`;
}

function ErrorView({ artifactPrefix, runMeta, error }: { artifactPrefix: string, runMeta: RunMeta, error: TestCase }): ReactNode {
  let artifactSrc = "";
  (error.stdout || "").replace(/Screenshot captured as '([^']*)'/, (_, capt1: string) => {
    if (capt1.length > 8) {
      const artifact = runMeta.artifacts.find(x => x.relativePath.endsWith(capt1));
      if (artifact) {
        artifactSrc = artifactPrefix + artifact?.relativePath;
      }
    }
    return '';
  });

  return <div>
    <div style={{ fontSize: "1.2rem" }}>{error.name}</div>
    <div style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>{error.suiteName}</div>
    <p>
      {artifactSrc && <img src={artifactSrc} alt='screenshot' height={400} />}
    </p>
    <pre>
      {error.errorDetails || ""}
      <hr />
      {error.errorStackTrace || ""}
      <hr />
      {error.stderr || ""}
      <hr />
      {error.stdout || ""}
    </pre>
  </div>
}

function RunView({ jobSpec, run, errorIdx }: { jobSpec: JobSpec, run: Run, errorIdx?: number }): ReactNode {
  const urlPrefix = `${jobBEUrl(jobSpec)}/${run.id}`;
  const runStatus = useGet<RunMeta>(`${urlPrefix}/api/json`);
  const runMeta = runStatus.data;
  const reportStatus = useGet<TestReport>(`${urlPrefix}/testReport/api/json`);
  const report = reportStatus.data;

  const [, setLocation] = useLocation();
  const showError = (errorIdx: number) => setLocation(`${jobFEUrl(jobSpec)}/runs/${run.id}/errors/${errorIdx}`);

  const errors = useMemo(() => {
    let res: TestCase[] = [];
    if (report) {
      res = report.suites.flatMap(suite => {
        return suite.cases.filter(x => x.status === 'FAILED').map(tcase => {
          return ({ ...tcase, suiteName: suite.name });
        });
      });
    }
    return res;
  }, [report]);

  if (!runMeta) { return <><ShowStatus status={runStatus} /><div></div></>; }

  const selError = errorIdx !== undefined ? errors[errorIdx] : undefined;

  const consoleUrl = `${JENKINS_SERVER}${jobBEUrl(jobSpec)}/${run.id}/consoleText`;

  return <>
    <div>
      <h2>
        {run.id} <JenkinsIcon url={`${jobJenkinsUrl(jobSpec)}/${run.id}/`} /> <a className="info" href={consoleUrl} target="_blank">Console Output</a>
      </h2>
      <h3 className={`status-${run.status}`}>{run.status}</h3>
      {report ?
        <p>{report.passCount} pass, {report.skipCount} skip, {report.failCount} fail</p> :
        reportStatus.status === 'loading' ?
          <ShowStatus status={reportStatus} /> :
          <p>Test Report: {reportStatus.error}</p>
      }
      {errors.map((error, i) =>
        <div
          key={error.name}
          className={classNames({ "active-row": true, "selected-row": i === errorIdx })}
          onClick={() => showError(i)}
        >
          <div style={{ fontSize: "1.2rem" }}>{error.name}</div>
          <div style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>{error.suiteName}</div>
        </div>
      )}
    </div>
    <div>
      {selError &&
        <ErrorView
          artifactPrefix={`${urlPrefix}/artifact/`}
          runMeta={runMeta}
          error={selError}
        />
      }
    </div>
  </>;
}

function StageView({ stage }: { stage: Stage }): ReactNode {
  const start = new Date(stage.startTimeMillis);
  let status = stage.durationMillis <= 0 ? 'IN_PROGRESS' : stage.status;
  const durationMillis = stage.durationMillis <= 0 ? Date.now() - stage.startTimeMillis : stage.durationMillis;
  const duration = Math.round(durationMillis / 1000);
  return <td key={stage.id}>
    <div className={`stage status-${status}`} title={`${stage.name} (${status}) @ ${timeFormSecs.format(start)}, ${formatDuration(duration)}`}>
      <span className='stage-name'>{stage.name}</span>
    </div>
  </td>;
}

function RunTable({ jobSpec, runs, runId }: { jobSpec: JobSpec, runs: Run[], runId?: string }): ReactNode {
  const [, setLocation] = useLocation();
  const showRun = (run: Run) => setLocation(`${jobFEUrl(jobSpec)}/runs/${run.id}`);

  return <table className="active-table run-table">
    {runs.map((run) => {
      const start = new Date(run.startTimeMillis);
      const duration = Math.round(run.durationMillis / 1000);
      return <tbody
        key={run.id}
        className={classNames({ "active-row": true, "selected-row": run.id === runId })}
        onClick={() => showRun(run)}
      >
        <tr>
          <td className={`nowrap status-${run.status}`} title={run.id}>{run.id}</td>
          {run.stages.map((stage) => <StageView stage={stage} />)}
        </tr>
        <tr className="info">
          <td className={`nowrap status-${run.status}`} title={run.status}>{run.status}</td>
          <td colSpan={run.stages.length} className="nowrap">
            {timeForm.format(start)} on {dateForm.format(start)}, {formatDuration(duration)}
          </td>
        </tr>
      </tbody>;
    })}
  </table>;
}

export interface JobViewProps {
  jobSpec: JobSpec;
  runId?: string;
  errorIdx?: number;
}

function JobHeader({ jobSpec, lastLoaded }: { jobSpec: JobSpec, lastLoaded?: Date }): ReactNode {
  const { orgName, repoName, jobName } = jobSpec;
  return <>
    <p>
      <Link href={`/`}>Start</Link>
      {' / '}
      <Link href={`/orgs/${orgName}`}>{duc(orgName)}</Link>
      {' / '}
      <Link href={`/orgs/${orgName}/repos/${repoName}`}>{duc(repoName)}</Link>
    </p>
    <h2>
      <Link href={jobFEUrl(jobSpec)}>{duc(jobName)}</Link>
      {' '}
      <JenkinsIcon url={`${jobJenkinsUrl(jobSpec)}/`} />
    </h2>
    {lastLoaded && <div className="updated-at">
      updated at {timeFormSecs.format(lastLoaded)}
    </div>}
  </>;
}

export default function JobView({ jobSpec, runId, errorIdx }: JobViewProps): ReactNode {
  const status = useGet<Run[]>(`${jobBEUrl(jobSpec)}/wfapi/runs`, 60);
  const runs = status.data;
  if (!runs) { return <ShowStatus status={status} />; }

  const selRun = runId ? runs.find(x => x.id === runId) : undefined;
  return <div className={classNames({ split: !!runId, split112: !!runId })}>
    <div>
      <JobHeader jobSpec={jobSpec} lastLoaded={status.lastLoaded} />
      <RunTable jobSpec={jobSpec} runs={runs} runId={runId} />
    </div>
    {selRun && <RunView jobSpec={jobSpec} run={selRun} errorIdx={errorIdx} />}
  </div>;
}
