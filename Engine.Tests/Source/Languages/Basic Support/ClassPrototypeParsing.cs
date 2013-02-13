﻿
// This file is part of Natural Docs, which is Copyright © 2003-2012 Greg Valure.
// Natural Docs is licensed under version 3 of the GNU Affero General Public License (AGPL)
// Refer to License.txt for the complete details


using System;
using NUnit.Framework;


namespace GregValure.NaturalDocs.Engine.Tests.Languages.BasicSupport
	{
	[TestFixture]
	public class ClassPrototypeParsing : Framework.TestTypes.ClassPrototypeParsing
		{

		[Test]
		public void All ()
			{
			TestFolder("Languages/Basic Support/Class Prototype Parsing", "Shared ND Config/Basic Language Support");
			}

		}
	}