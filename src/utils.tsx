import { useState, ReactNode, useEffect } from "react";

export function duc(s: string): string {
  return decodeURIComponent(s);
}

export interface Status<T> {
  url: string;
  status: 'loading' | 'error' | 'ready';
  error?: string;
  data?: T;
  lastLoaded?: Date;
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
}

export function useGet<T>(url: string, refreshSecs = 0): Status<T> {
  const [status, setStatus] = useState<Status<T>>({ url: "", status: 'loading' });

  function fetchIt(): void {
    fetchJson<T>(url).then((data) => {
      setStatus(cur => {
        if (cur.url !== url) { return cur };
        return { url, status: 'ready', data, lastLoaded: new Date() };
      });
    }, (error) => {
      setStatus(cur => {
        if (cur.url !== url) { return cur };
        return { url, status: 'error', error: '' + error, data: cur.data };
      });
    });
  }

  useEffect(() => {
    if (refreshSecs) {
      const int = setInterval(fetchIt, refreshSecs * 1000);
      return () => clearTimeout(int);
    }
  }, [url, refreshSecs]);

  if (url !== status.url) {
    setStatus({ url, status: 'loading' });
    fetchIt();
  }

  return status;
}

export function ShowStatus({ status }: { status: Status<unknown> }): ReactNode {
  if (status.status === 'loading') {
    return <h3>Loading {status.url}...</h3>;
  } else if (status.status === 'error') {
    return <div>
      <h2>Error</h2>
      <b>url: {status.url}</b>
      <pre>{status.error}</pre>
    </div>;
  } else {
    return <h3>Ready {status.url}</h3>;
  }
}

export function JenkinsIcon({ url }: { url: string }): ReactNode {
  return <a href={`${JENKINS_SERVER}${url}`} target='_blank' className='jenkins-icon'>
    <img src='/jenkins.svg' width={24} height={24} alt='go to jenkins' />
  </a>;
}
