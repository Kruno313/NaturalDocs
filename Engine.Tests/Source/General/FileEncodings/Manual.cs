﻿
// This file is part of Natural Docs, which is Copyright © 2003-2022 Code Clear LLC.
// Natural Docs is licensed under version 3 of the GNU Affero General Public License (AGPL)
// Refer to License.txt for the complete details


using System;
using NUnit.Framework;


namespace CodeClear.NaturalDocs.Engine.Tests.General.FileEncodings
	{
	[TestFixture]
	public class Manual : Framework.TestTypes.Topics
		{

		[Test]
		public void All ()
			{
			TestFolder("General/File Encodings/Manual", "Shared ND Config/Manual File Encodings");
			}

		}
	}