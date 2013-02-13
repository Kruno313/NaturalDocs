﻿
// This file is part of Natural Docs, which is Copyright © 2003-2012 Greg Valure.
// Natural Docs is licensed under version 3 of the GNU Affero General Public License (AGPL)
// Refer to License.txt for the complete details


using System;
using NUnit.Framework;


namespace GregValure.NaturalDocs.Engine.Tests.Comments.NaturalDocs
	{
	[TestFixture]
	public class Parsing : Framework.TestTypes.NDMarkup
		{

		[Test]
		public void All ()
			{
			TestFolder("Comments/Natural Docs/Parsing");
			}

		}
	}