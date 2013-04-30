﻿/* 
 * Class: GregValure.NaturalDocs.Engine.Comments.Manager
 * ____________________________________________________________________________
 * 
 * A module which will handle comment parsing.
 * 
 * 
 * Usage:
 * 
 *		- Call <Engine.Instance.Start()> which will start this module.
 */

// This file is part of Natural Docs, which is Copyright © 2003-2013 Greg Valure.
// Natural Docs is licensed under version 3 of the GNU Affero General Public License (AGPL)
// Refer to License.txt for the complete details


using System;
using System.Collections.Generic;
using GregValure.NaturalDocs.Engine.Topics;


namespace GregValure.NaturalDocs.Engine.Comments
	{
	public class Manager
		{
		
		// Group: Functions
		// __________________________________________________________________________
		
		
		/* Function: Manager
		 */
		public Manager ()
			{
			lineFinder = new Parsers.LineFinder();

			naturalDocsParser = new Parsers.NaturalDocs();
			xmlParser = new Parsers.XML();
			javadocParser = new Parsers.Javadoc();
			}
			
			
		/* Function: Start
		 * 
		 * Dependencies:
		 * 
		 *		- <Config.Manager> and <TopicTypes.Manager> must be started before using the rest of the class.
		 */
		public bool Start (Errors.ErrorList errors)
			{
			return (lineFinder.Start(errors) &&
					  naturalDocsParser.Start(errors) &&
					  xmlParser.Start(errors) &&
					  javadocParser.Start(errors));
			}
			
			
		/* Function: Parse
		 * Parses the passed comment for documentation.  If successful it will return true and add <Topics> to the list.
		 */
		public bool Parse (PossibleDocumentationComment comment, List<Topic> topics)
			{
			// Apply to all comments, not just Natural Docs'.  Javadoc comments may use a left line of stars which would
			// need to be taken out.
			lineFinder.MarkTextBoxes(comment);
			
			// First try Natural Docs while requiring a header.  If the first line is a header it's treated as Natural Docs content 
			// regardless of comment style.
			if (naturalDocsParser.Parse(comment, topics, true) == true)
				{  return true;  }
				
			// Next try Javadoc.  We test this before XML so it's not mistaken for it if it starts with a HTML tag.
			if (comment.Javadoc && 
				javadocParser.Parse(comment, topics) == true)
				{  return true;  }

			// Next try XML.  XML can actually use the Javadoc comment style as well.
			if ((comment.XML || comment.Javadoc) &&
				xmlParser.Parse(comment, topics) == true)
				{  return true;  }

			// If neither of them were able to parse it, we can assume comments using the XML or Javadoc styles are headerless 
			// Natural Docs comments.
			if ((comment.Javadoc || comment.XML) &&
				naturalDocsParser.Parse(comment, topics, false) == true)
				{  return true;  }
				
			return false;
			}
			
			
			
		// Group: Properties
		// __________________________________________________________________________
		
		
		/* Property: LineFinder
		 * A reference to <Parsers.LineFinder> so that other parsers may use it to detect horizontal lines.
		 */
		public Parsers.LineFinder LineFinder
			{
			get
				{  return lineFinder;  }
			}
			
			
		/* Property: NaturalDocsParser
		 * A reference to <Parsers.NaturalDocs> so that other code can call <Parsers.NaturalDocs.LinkInterpretations()>.
		 */
		public Parsers.NaturalDocs NaturalDocsParser
			{
			get
				{  return naturalDocsParser;  }
			}
			
			
		/* Property: XMLParser
		 * A reference to <Parsers.XML>.
		 */
		public Parsers.XML XMLParser
			{
			get
				{  return xmlParser;  }
			}


		/* Property: JavadocParser
		 * A reference to <Parsers.Javadoc>.
		 */
		public Parsers.Javadoc JavadocParser
			{
			get
				{  return javadocParser;  }
			}
			
			

		// Group: Variables
		// __________________________________________________________________________


		protected Parsers.LineFinder lineFinder;		
		
		protected Parsers.NaturalDocs naturalDocsParser;
		protected Parsers.XML xmlParser;
		protected Parsers.Javadoc javadocParser;
		
		}
	}