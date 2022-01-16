﻿
// This file is part of Natural Docs, which is Copyright © 2003-2022 Code Clear LLC.
// Natural Docs is licensed under version 3 of the GNU Affero General Public License (AGPL)
// Refer to License.txt for the complete details


using System;
using NUnit.Framework;
using CodeClear.NaturalDocs.Engine.Tests.Framework;


namespace CodeClear.NaturalDocs.Engine.Tests.Output.HTML.ClassPrototypes
	{
	[TestFixture]
	public class BasicSupport : Framework.SourceToHTML
		{

		[Test]
		public void All ()
			{
			TestFolder("Output/HTML/Class Prototypes/Basic Support", "Shared ND Config/Basic Language Support", "div",
						   "NDClassPrototype", true, outputTitle: "Class Prototype Tests", outputSubtitle: "Basic Language Support");
			}

		}
	}
