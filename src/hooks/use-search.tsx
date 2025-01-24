import { UserType } from '@/types';
import { useState, useEffect } from 'react';

const useSearch = (searchInput: string) => {
  const [results, setResults] = useState<UserType[] | null>(null);
  const [loadingResults, setLoading] = useState<boolean>(true);
  const [errorResults, setError] = useState<null | string>(null);

  useEffect(() => {
    if (!searchInput) return;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/api/search-users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-cache',
          body: JSON.stringify({ input: searchInput }),
        });

        if (!response.ok) {
          throw new Error(`Error fetching user: ${response.statusText}`);
        }

        const { results: resultsData} = await response.json();
        setResults(resultsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [searchInput]);

  return { results, loadingResults, errorResults };
};

export default useSearch;
