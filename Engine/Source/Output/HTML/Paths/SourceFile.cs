﻿/* 
 * Class: CodeClear.NaturalDocs.Engine.Output.HTML.Paths.SourceFile
 * ____________________________________________________________________________
 * 
 * Path functions relating to source files in HTML output.
 * 
 */

// This file is part of Natural Docs, which is Copyright © 2003-2020 Code Clear LLC.
// Natural Docs is licensed under version 3 of the GNU Affero General Public License (AGPL)
// Refer to License.txt for the complete details


using System;
using System.Text;


namespace CodeClear.NaturalDocs.Engine.Output.HTML.Paths
	{
	static public class SourceFile
		{

		/* Function: OutputFolder
		 * 
		 * Returns the output folder of the passed output target, file source number, and optionally a subfolder within it.
		 * If the subfolder is null it returns the root output folder for the target and file source number.
		 * 
		 * Examples:
		 * 
		 *		targetOutputFolder + fileSourceNumber - C:\Project\Documentation\files
		 *		targetOutputFolder + fileSourceNumber + subfolder - C:\Project\Documentation\files\Folder1\Folder2
		 */
		static public Path OutputFolder (Path targetOutputFolder, int fileSourceNumber, Path subfolder = default(Path))
			{
			StringBuilder result = new StringBuilder(targetOutputFolder);
			result.Append("/files");  

			if (fileSourceNumber != 1)
				{  result.Append(fileSourceNumber);  }
					
			if (subfolder != null)
				{
				result.Append('/');
				result.Append(Utilities.Sanitize(subfolder));
				}

			return result.ToString();
			}


		/* Function: FolderHashPath
		 * 
		 * Returns the folder part of the hash path of the passed file source number and subfolder.  If the subfolder is null it
		 * returns the root hash path for the file source number.  The hash path will always include a trailing separator so that
		 * the file name can simply be concatenated.
		 * 
		 * Examples:
		 * 
		 *		fileSourceNumber - File:
		 *		fileSourceNumber + subfolder - File:Folder1/Folder2/
		 */
		static public string FolderHashPath (int fileSourceNumber, Path subfolder = default(Path))
			{
			StringBuilder result = new StringBuilder("File");

			if (fileSourceNumber != 1)
				{  result.Append(fileSourceNumber);  }

			result.Append(':');

			// Since we're building a string we can't rely on Path to simplify out ./					
			if (subfolder != null && subfolder != ".")
				{
				result.Append(Utilities.Sanitize(subfolder.ToURL()));
				result.Append('/');
				}

			return result.ToString();
			}

		}
	}
