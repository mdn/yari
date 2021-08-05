import concurrent.futures

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


def requests_retry_session(
    retries=3,
    backoff_factor=0.3,
    status_forcelist=(500, 502, 504),
):
    """Opinionated wrapper that creates a requests session with a
    HTTPAdapter that sets up a Retry policy that includes connection
    retries.

    If you do the more naive retry by simply setting a number. E.g.::

        adapter = HTTPAdapter(max_retries=3)

    then it will raise immediately on any connection errors.
    Retrying on connection errors guards better on unpredictable networks.
    From http://docs.python-requests.org/en/master/api/?highlight=retries#requests.adapters.HTTPAdapter
    it says: "By default, Requests does not retry failed connections."

    The backoff_factor is documented here:
    https://urllib3.readthedocs.io/en/latest/reference/urllib3.util.html#urllib3.util.retry.Retry
    A default of retries=3 and backoff_factor=0.3 means it will sleep like::

        [0.3, 0.6, 1.2]
    """  # noqa
    session = requests.Session()
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def check_urls(urls, verbose=False):
    session = requests_retry_session(
        backoff_factor=0.1,
        retries=2,
    )
    results = {}
    futures = {}
    with concurrent.futures.ThreadPoolExecutor() as executor:
        for url in urls:
            futures[executor.submit(check_url, url, session, verbose)] = url
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            results[futures[future]] = result
    return results


operational_errors = (
    requests.exceptions.SSLError,
    requests.exceptions.ReadTimeout,
    requests.exceptions.ConnectionError,
    requests.exceptions.RetryError,
    requests.exceptions.TooManyRedirects,
)


def check_url(url, session, verbose=False):
    try:
        response = session.get(url)
        if verbose:
            print(f"Checked {url:<100} => {response.status_code}")
        return {
            "status_code": response.status_code,
        }
    except operational_errors as error:
        if verbose:
            print(f"Checked {url:<100} =!> {error}")
        return {"error": error}
