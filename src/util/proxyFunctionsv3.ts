import { ProxyType } from '../types/proxyAuth';

export async function notifyProxyChangev3(
  proxyType: ProxyType,
  link: string,
  requestId: string,
  time: number,
  hosts?: string[],
) {
  const host = new URL(link).hostname;
  const encodedHosts = encodeURIComponent(JSON.stringify(hosts || []));
  const response = await fetch(
    `http://127.0.0.1:8080/v3/notify?proxy=${proxyType}&host=${host}&hosts=${encodedHosts}&time=${time}&requestId=${requestId}`,
  );
  if (response.status === 200) {
    return response.text();
  } else {
    throw new Error(`Failed to notify proxy. Status code: ${response.status}`);
  }
}

export async function terminateConnectionv3(requestId: string) {
  const response = await fetch(
    `http://127.0.0.1:8080/v3/terminate?requestId=${requestId}`,
  );
  if (response.status === 200) {
    return response.text();
  } else {
    throw new Error(`Failed to notify proxy. Status code: ${response.status}`);
  }
}

export async function registerRequestv3(
  link: string,
  requestId: string,
  hosts: string[],
  time: number,
  proxyType: ProxyType,
) {
  try {
    const host = new URL(link).hostname;
    const encodedHosts = encodeURIComponent(JSON.stringify(hosts || []));
    const response = await fetch(
      `http://127.0.0.1:8080/v3/register?host=${host}&proxyType=${proxyType}&hosts=${encodedHosts}&requestId=${requestId}&time=${time}`,
    );
    if (response.status === 200) {
      return response.text();
    } else {
      throw new Error(
        `Failed to notify proxy. Status code: ${response.status}`,
      );
    }
  } catch (error) {}
}

export async function requestCompletedv3(requestId: string) {
  const response = await fetch(
    `http://127.0.0.1:8080/v3/completed?requestId=${requestId}`,
  );
  if (response.status === 200) {
    return response;
  } else {
    throw new Error(`Failed to notify proxy. Status code: ${response.status}`);
  }
}
