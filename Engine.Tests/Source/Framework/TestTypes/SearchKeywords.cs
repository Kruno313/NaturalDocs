﻿/* 
 * Class: GregValure.NaturalDocs.Engine.Tests.Framework.TestTypes.SearchKeywords
 * ____________________________________________________________________________
 * 
 * File-based tests to make sure Natural Docs can generate search keywords correctly.
 * 
 */

// This file is part of Natural Docs, which is Copyright © 2003-2013 Greg Valure.
// Natural Docs is licensed under version 3 of the GNU Affero General Public License (AGPL)
// Refer to License.txt for the complete details


using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using GregValure.NaturalDocs.Engine;
using GregValure.NaturalDocs.Engine.Symbols;
using GregValure.NaturalDocs.Engine.Tests.Framework;
using GregValure.NaturalDocs.Engine.Topics;


namespace GregValure.NaturalDocs.Engine.Tests.Framework.TestTypes
	{
	public class SearchKeywords : Framework.SourceToTopics
		{

		public override string OutputOf (IList<Topic> topics)
			{
			if (topics == null || topics.Count == 0)
				{  return "(No topics found)";  }

			StringBuilder output = new StringBuilder();

			for (int i = 0; i < topics.Count; i++)
				{
				if (i != 0)
					{  output.AppendLine();  }

				output.AppendLine("Topic: " + topics[i].Title);

				Engine.SearchIndex.TopicEntry searchEntry = new Engine.SearchIndex.TopicEntry(topics[i]);

				output.Append("- Display Name: ");

				if (searchEntry.EndOfDisplayNameQualifiers > 0)
					{
					output.Append('(');
					output.Append(searchEntry.DisplayName, 0, searchEntry.EndOfDisplayNameQualifiers);
					output.Append(')');
					output.Append(searchEntry.DisplayName, searchEntry.EndOfDisplayNameQualifiers, 
										 searchEntry.DisplayName.Length - searchEntry.EndOfDisplayNameQualifiers);
					output.AppendLine();
					}
				else
					{  output.AppendLine(searchEntry.DisplayName);  }

				output.Append("- Search Text: ");

				if (searchEntry.EndOfSearchTextQualifiers > 0)
					{
					output.Append('(');
					output.Append(searchEntry.SearchText, 0, searchEntry.EndOfSearchTextQualifiers);
					output.Append(')');
					output.Append(searchEntry.SearchText, searchEntry.EndOfSearchTextQualifiers, 
										 searchEntry.SearchText.Length - searchEntry.EndOfSearchTextQualifiers);
					output.AppendLine();
					}
				else
					{  output.AppendLine(searchEntry.SearchText);  }

				output.Append("- Keywords: ");

				if (searchEntry.Keywords == null || searchEntry.Keywords.Count == 0)
					{  output.AppendLine("(none)");  }
				else
					{  output.AppendLine(string.Join(", ", searchEntry.Keywords.ToArray()));  }
				}

			return output.ToString();
			}

		}
	}