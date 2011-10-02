﻿/*
	Include in output:

	This file is part of Natural Docs, which is Copyright © 2003-2011 Greg Valure.
	Natural Docs is licensed under version 3 of the GNU Affero General Public
	License (AGPL).  Refer to License.txt or www.naturaldocs.org for the
	complete details.

	This file may be distributed with documentation files generated by Natural Docs.
	Such documentation is not covered by Natural Docs' copyright and licensing,
	and may have its own copyright and distribution terms as decided by its author.


	Substitutions:

		Summary Language Members:

			`Language_NameHTML = 0
			`Language_SimpleIdentifier = 1

		Summary Topic Types Members:

			`TopicType_PluralNameHTML = 0
			`TopicType_SimpleIdentifier = 1

		Summary Entry Members:

			`Entry_TopicID = 0
			`Entry_LanguageIndex = 1
			`Entry_TopicTypeIndex = 2
			`Entry_NameHTML = 3
			`Entry_Symbol = 4

*/

"use strict";


/* Class: NDSummary
	___________________________________________________________________________

*/
var NDSummary = new function ()
	{ 

	// Group: Functions
	// ________________________________________________________________________


	/* Function: Start
	*/
	this.Start = function ()
		{
		this.UpdateSummary();
		};


	/* Function: GoToFileHashPath
		Changes the current summary to the passed hash string, such as "File2:folder/folder/file.cs".
	*/
	this.GoToFileHashPath = function (hashPath)
		{
		var head = document.getElementsByTagName("head")[0];


		// Remove the previous loaders if there are any.

		var loader = document.getElementById("NDSummaryLoader");

		if (loader)
			{  head.removeChild(loader);  }

		loader = document.getElementById("NDSummaryTooltipsLoader");

		if (loader)
			{  head.removeChild(loader);  }


		// Reset the state

		this.summaryLanguages = undefined;
		this.summaryTopicTypes = undefined;
		this.summaryEntries = undefined;
		this.summaryTooltips = undefined;


		// Create a new summary loader.  We don't load the tooltips until the summary is complete to
		// avoid having to wait for a potentially large file.

		var script = document.createElement("script");
		script.src = NDCore.FileHashPathToSummaryPath(hashPath);
		script.type = "text/javascript";
		script.id = "NDSummaryLoader";

		head.appendChild(script);
		};


	/* Function: OnSummaryLoaded
	*/
	this.OnSummaryLoaded = function (hashPath, summaryLanguages, summaryTopicTypes, summaryEntries)
		{
		if (hashPath == NDFramePage.hashPath)
			{  
			this.summaryLanguages = summaryLanguages;
			this.summaryTopicTypes = summaryTopicTypes;
			this.summaryEntries = summaryEntries;

			this.UpdateSummary();  


			// Load the tooltips.  We only do this after the summary is loaded to avoid having to wait for it.

			var head = document.getElementsByTagName("head")[0];

			var script = document.createElement("script");
			script.src = NDCore.FileHashPathToSummaryTooltipsPath(hashPath);
			script.type = "text/javascript";
			script.id = "NDSummaryTooltipsLoader";

			head.appendChild(script);
			}
		};


	/* Function: OnSummaryTooltipsLoaded
	*/
	this.OnSummaryTooltipsLoaded = function (hashPath, summaryTooltips)
		{
		if (hashPath == NDFramePage.hashPath)
			{  
			this.summaryTooltips = summaryTooltips;
			}
		};


	/* Function: UpdateSummary
	*/
	this.UpdateSummary = function ()
		{
		var newContent = document.createElement("div");
		newContent.id = "SContent";

		if (this.summaryEntries == undefined)
			{  
			var loadingNotice = document.createElement("div");
			loadingNotice.className = "SLoadingNotice";
			newContent.appendChild(loadingNotice);
			}
		else
			{
			for (var i = 0; i < this.summaryEntries.length; i++)
				{
				var entry = this.summaryEntries[i];
				var entryHTML = document.createElement("a");

				var classString = "SEntry" + 
					" L" + this.summaryLanguages[ entry[`Entry_LanguageIndex] ][`Language_SimpleIdentifier] +
					" T" + this.summaryTopicTypes[ entry[`Entry_TopicTypeIndex] ][`TopicType_SimpleIdentifier] +
					(i == 0 ? " first" : "") +
					(i == this.summaryEntries.length - 1 ? " last" : "");

				entryHTML.className = classString;
				entryHTML.setAttribute("href", "javascript:NDSummary.GoToAnchor(\"" + entry[`Entry_Symbol] + "\")");
				entryHTML.innerHTML = entry[`Entry_NameHTML];

				newContent.appendChild(entryHTML);
				}
			}

		var oldContent = document.getElementById("SContent");
		oldContent.parentNode.replaceChild(newContent, oldContent);
		};


	/* Function: GoToAnchor
	*/
	this.GoToAnchor = function (anchor)
		{
		var frame = document.getElementById("CFrame");
		frame.contentWindow.location.hash = "#" + anchor;
		};



	// Group: Variables
	// ________________________________________________________________________


	/* var: summaryLanguages
	*/
		// this.summaryLanguages = undefined;

	/* var: summaryTopicTypes
	*/
		// this.summaryTopicTypes = undefined;

	/* var: summaryEntries
	*/
		// this.summaryEntries = undefined;

	/* var: summaryTooltips
	*/
		// this.summaryTooltips = undefined;
	};
