import { PATH_SEPARATOR } from '$lib/util/object.js';

/**
 * Convert a path string to an array path
 * - The path string will be spit at the `pathSeparator` token
 * - If the supplied path is already an array, the original array will
 *   be returned
 *
 * @param {string|string[]} path
 *   String or array path (e.g. "some.path.to")
 *
 * @param {string} [pathSeparator=PATH_SEPARATOR]
 *   A custom path separator to use instead of the default "."
 *
 * @returns {string} string path (e.g. "some.path.to")
 */
export function toStringPath(path, pathSeparator = PATH_SEPARATOR) {
  if (Array.isArray(path)) {
    return path.join(pathSeparator);
  } else if (typeof path === 'string') {
    // path is already a string
    return path;
  } else {
    throw new Error(
      'Missing or invalid parameter [path] (expected string or array)'
    );
  }
}

// -----------------------------------------------------------------------------

/**
 * Make sure that the outputted path is an array path
 * - The input value may be a array path
 * - The input value may be a string path (no conversion needed)
 *
 * @param {string|string[]} path
 *
 * @returns {string[]} array path (list of strings)
 */
// export function fromPath( path )
// {
//   if( typeof path === "string" )
//   {
//     return path;
//   }
//   else {
//     expect.array( path,
//       "Missing or invalid parameter [path] (expected string or string[])" );

//     let strPath = proc.arrayToStringPathWeakMap.get( path );

//     if( strPath )
//     {
//       // std.debug( "Using cached value", path );
//       return strPath;
//     }

//     // Check array path
//     for( let j = 0, n = path.length; j < n; j = j + 1 )
//     {
//       if( typeof path[j] !== "string" )
//       {
//         throw new Error("Invalid array path. Expected array of strings");
//       }
//     }

//     strPath = path.join("/");

//     proc.safeArrayPathsWeakMap.set( path, true );
//     proc.arrayToStringPathWeakMap.set( path, strPath );

//     return strPath;
//   }
// }
