import { ProxyType } from '../types/proxyAuth';

export async function notifyProxyChange(
  proxyType: ProxyType,
  link: string,
  requestId: string,
  time: number,
  hosts?: string[],
) {
  const host = new URL(link).hostname;
  const encodedHosts = encodeURIComponent(JSON.stringify(hosts || []));
  const response = await fetch(
    `http://127.0.0.1:8080/notify?proxy=${proxyType}&host=${host}&hosts=${encodedHosts}&time=${time}&requestId=${requestId}`,
  );
  if (response.status === 200) {
    return response.text();
  } else {
    throw new Error(`Failed to notify proxy. Status code: ${response.status}`);
  }
}

export async function terminateConnection(requestId: string) {
  const response = await fetch(
    `http://127.0.0.1:8080/terminate?requestId=${requestId}`,
  );
  if (response.status === 200) {
    return response.text();
  } else {
    throw new Error(`Failed to notify proxy. Status code: ${response.status}`);
  }
}

export async function connectionHealth(
  link: string,
  requestId: string,
  hosts: string[] = [],
  proxyType?: ProxyType,
  prevProxyType?: ProxyType,
) {
  const host = new URL(link).hostname;
  const response = await fetch(
    `http://127.0.0.1:8080/connection-health?requestId=${requestId}&host=${host}&hosts=${encodeURIComponent(JSON.stringify(hosts))}&prevProxyType=${prevProxyType}&proxyType=${proxyType}`,
  );
  if (response.status === 200) {
    return response.text();
  } else {
    return response.text();
  }
}

export async function terminationPrevConnections(
  requestId: string,
  link: string,
  hosts: string[] = [],
  prevProxyType: ProxyType,
) {
  const host = new URL(link).hostname;
  const response = await fetch(
    `http://127.0.0.1:8080/terminate-prev-connections?requestId=${requestId}&host=${host}&hosts=${encodeURIComponent(JSON.stringify(hosts))}&prevProxyType=${prevProxyType}`,
  );
  if (response.status === 200) {
    return response.text();
  } else {
    throw new Error(`Failed to notify proxy. Status code: ${response.status}`);
  }
}

export async function registerRequest(
  link: string,
  requestId: string,
  hosts: string[],
  time: number,
) {
  try {
    const host = new URL(link).hostname;
    const encodedHosts = encodeURIComponent(JSON.stringify(hosts));
    const response = await fetch(
      `http://127.0.0.1:8080/register?host=${host}&hosts=${encodedHosts}&requestId=${requestId}&time=${time}`,
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

export async function requestCompleted(requestId: string) {
  const response = await fetch(
    `http://127.0.0.1:8080/completed?requestId=${requestId}`,
  );
  if (response.status === 200) {
    return response;
  } else {
    throw new Error(`Failed to notify proxy. Status code: ${response.status}`);
  }
}
