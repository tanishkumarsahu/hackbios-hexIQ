/**
 * Robust Query Handler - Fixes intermittent data fetching issues
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Configurable timeout protection
 * - Network status awareness
 * - Graceful error handling
 * - Detailed logging
 */

// Network status detection
export const useNetworkStatus = () => {
  if (typeof window === 'undefined') return { isOnline: true, isSlowConnection: false };
  
  const isOnline = navigator.onLine;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  const isSlowConnection = connection ? 
    (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') : 
    false;
    
  return { isOnline, isSlowConnection };
};

/**
 * Robust query wrapper with timeout, retry, and error handling
 */
export const robustQuery = async (queryFn, options = {}) => {
  const { 
    timeout = 30000,      // 30 second timeout for slow Supabase
    retries = 3,          // 3 retry attempts
    fallback = null,      // Fallback data
    logPrefix = 'Query',  // Log prefix for debugging
    validateResult = null // Custom result validation
  } = options;
  
  const { isOnline, isSlowConnection } = useNetworkStatus();
  
  // Adjust timeout for slow connections
  const adjustedTimeout = isSlowConnection ? timeout * 2 : timeout;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`🔄 ${logPrefix} attempt ${attempt + 1}/${retries}`);
      
      // Check network status
      if (!isOnline) {
        throw new Error('Network offline');
      }
      
      // Execute query with timeout
      const result = await Promise.race([
        queryFn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), adjustedTimeout)
        )
      ]);
      
      // Check for Supabase errors
      if (result?.error) {
        throw new Error(result.error.message || 'Supabase error');
      }
      
      // Custom validation
      if (validateResult && !validateResult(result)) {
        throw new Error('Result validation failed');
      }
      
      console.log(`✅ ${logPrefix} succeeded on attempt ${attempt + 1}`);
      return { 
        success: true, 
        data: result.data || result, 
        count: result.count,
        attempt: attempt + 1 
      };
      
    } catch (error) {
      const isLastAttempt = attempt === retries - 1;
      
      console.warn(`⚠️ ${logPrefix} attempt ${attempt + 1} failed:`, error.message);
      
      if (isLastAttempt) {
        console.error(`❌ ${logPrefix} failed after ${retries} attempts`);
        return { 
          success: false, 
          error: error.message, 
          data: fallback,
          attempt: attempt + 1
        };
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const backoffDelay = 1000 * Math.pow(2, attempt);
      console.log(`⏳ Retrying ${logPrefix} in ${backoffDelay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
};

/**
 * Robust batch query handler using Promise.allSettled
 * Prevents cascade failures - each query is independent
 */
export const robustBatchQuery = async (queries, options = {}) => {
  const { logPrefix = 'Batch Query' } = options;
  
  console.log(`🔄 ${logPrefix} starting ${queries.length} parallel queries`);
  
  try {
    // Use Promise.allSettled to prevent cascade failures
    const results = await Promise.allSettled(
      queries.map((query, index) => 
        robustQuery(query.fn, {
          ...query.options,
          logPrefix: `${logPrefix}[${index}]`
        })
      )
    );
    
    // Process results
    const processedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`❌ ${logPrefix}[${index}] rejected:`, result.reason);
        return { 
          success: false, 
          error: result.reason.message, 
          data: queries[index].fallback || null 
        };
      }
    });
    
    const successCount = processedResults.filter(r => r.success).length;
    console.log(`✅ ${logPrefix} completed: ${successCount}/${queries.length} successful`);
    
    return {
      success: successCount > 0, // Partial success is still success
      results: processedResults,
      successCount,
      totalCount: queries.length
    };
    
  } catch (error) {
    console.error(`❌ ${logPrefix} batch failed:`, error);
    return {
      success: false,
      error: error.message,
      results: queries.map(q => ({ success: false, data: q.fallback || null })),
      successCount: 0,
      totalCount: queries.length
    };
  }
};

/**
 * Simple timeout wrapper for quick fixes
 */
export const createTimeoutQuery = (query, timeout = 10000) => {
  return Promise.race([
    query,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), timeout)
    )
  ]);
};

/**
 * Retry wrapper with exponential backoff
 */
export const retryQuery = async (queryFn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await queryFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = 1000 * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export default robustQuery;
