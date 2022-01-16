﻿/*
	Include in output:

	This file is part of Natural Docs, which is Copyright © 2003-2022 Code Clear LLC.
	Natural Docs is licensed under version 3 of the GNU Affero General Public
	License (AGPL).  Refer to License.txt or www.naturaldocs.org for the
	complete details.

	This file may be distributed with documentation files generated by Natural Docs.
	Such documentation is not covered by Natural Docs' copyright and licensing,
	and may have its own copyright and distribution terms as decided by its author.
*/

// Summary Language Members

	$Language_NameHTML = 0;
	$Language_SimpleIdentifier = 1;

// Summary Comment Types Members

	$CommentType_PluralNameHTML = 0;
	$CommentType_SimpleIdentifier = 1;

// Summary Entry Members

	$Entry_TopicID = 0;
	$Entry_LanguageIndex = 1;
	$Entry_CommentTypeIndex = 2;
	$Entry_NameHTML = 3;
	$Entry_Symbol = 4;

// Other

	$ToolTipDelay = 350;
	$ToolTipRightEdgeMargin = 5;
	$ToolTipBottomEdgeMargin = 25;  /* leave space for link address pop-up */
	$LoadingNoticeDelay = 250;


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
		this.toolTipHolder = document.createElement("div");
		this.toolTipHolder.style.display = "none";
		this.toolTipHolder.style.position = "fixed";
		this.toolTipHolder.style.zIndex = 21;  // documented in default.css
		document.body.appendChild(this.toolTipHolder);
		};


	/* Function: OnLocationChange

		Called by <NDFramePage> whenever the location hash changes.

		Parameters:

			oldLocation - The <NDLocation> we were previously at, or undefined if there is none because this is the
							   first call after the page is loaded.
			newLocation - The <NDLocation> we are navigating to.
	*/
	this.OnLocationChange = function (oldLocation, newLocation)
		{
		// First kill the tool tip.  If it was open and they clicked an entry, obviously they want the whole topic
		// and the tool tip is just in the way now.
		this.ResetToolTip();

		// It's possible we've navigated to a different member of the same file, so check to see if we need to do anything.
		if (oldLocation == undefined || oldLocation.type != newLocation.type || oldLocation.path != newLocation.path)
			{

			// Reset the state

			this.summaryLanguages = undefined;
			this.summaryCommentTypes = undefined;
			this.summaryEntries = undefined;
			this.summaryToolTips = undefined;


			// If this is the first build of the summary, build the empty one right away to put up the loading notice.
			if (oldLocation == undefined)
				{  this.Build();  }

			// If there's already a summary up, wait a short delay before replacing it with a loading notice.  If the data comes
			// back fast enough this will allow us to transition directly from the old summary to the new one without causing a
			// visible flicker.  This is important when running docs from the hard drive.
			else if (this.delayedLoadingTimeout == undefined)
				{
				this.delayedLoadingTimeout = setTimeout( function ()
					{
					if (NDSummary.summaryLanguages == undefined)
						{  NDSummary.Build();  }

					clearTimeout(NDSummary.delayedLoadingTimout);
					NDSummary.delayedLoadingTimeout = undefined;
					},
					$LoadingNoticeDelay);
				}


			// Remove the previous loaders if there are any.

			var head = document.getElementsByTagName("head")[0];
			var loader = document.getElementById("NDSummaryLoader");

			if (loader)
				{  head.removeChild(loader);  }

			loader = document.getElementById("NDSummaryToolTipsLoader");

			if (loader)
				{  head.removeChild(loader);  }


			// Create a new summary loader.  We don't load the tooltips until the summary is complete to
			// avoid having to wait for a potentially large file.

			if (newLocation.summaryFile)
				{  NDCore.LoadJavaScript(newLocation.summaryFile, "NDSummaryLoader");  }
			}

		this.FinishNavigation();
		};


	/* Function: OnSummaryLoaded
	*/
	this.OnSummaryLoaded = function (hashPath, summaryLanguages, summaryCommentTypes, summaryEntries)
		{
		if (hashPath == NDFramePage.currentLocation.path)
			{
			this.summaryLanguages = summaryLanguages;
			this.summaryCommentTypes = summaryCommentTypes;
			this.summaryEntries = summaryEntries;

			this.Build();
			this.FinishNavigation();


			// Load the tooltips.  We only do this after the summary is loaded to avoid having to wait for it.

			NDCore.LoadJavaScript(NDFramePage.currentLocation.summaryTTFile, "NDSummaryToolTipsLoader");
			}
		};


	/* Function: OnToolTipsLoaded
	*/
	this.OnToolTipsLoaded = function (hashPath, summaryToolTips)
		{
		if (hashPath == NDFramePage.currentLocation.path)
			{
			this.summaryToolTips = summaryToolTips;

			// The user may already be hovering over a summary entry by the time the tooltips are loaded.
			if (this.showingToolTip != undefined && summaryToolTips[this.showingToolTip] != undefined)
				{  this.ShowToolTip();  }
			}
		};


	/* Function: Build
	*/
	this.Build = function ()
		{
		var newContent = document.createElement("div");
		newContent.id = "SuContent";

		if (this.summaryEntries == undefined)
			{
			var loadingNotice = document.createElement("div");
			loadingNotice.className = "SuLoadingNotice";
			newContent.appendChild(loadingNotice);
			}
		else
			{
			var mouseOverHandler = function (e) {  NDSummary.OnEntryMouseOver(e);  };
			var mouseOutHandler = function (e) {  NDSummary.OnEntryMouseOut(e);  };

			for (var i = 0; i < this.summaryEntries.length; i++)
				{
				var entry = this.summaryEntries[i];

				if (entry[$Entry_NameHTML] != undefined)
					{
					var entryHTML = document.createElement("a");

					var classString = "SuEntry" +
						" L" + this.summaryLanguages[ entry[$Entry_LanguageIndex] ][$Language_SimpleIdentifier] +
						" T" + this.summaryCommentTypes[ entry[$Entry_CommentTypeIndex] ][$CommentType_SimpleIdentifier] +
						(i == 0 ? " first" : "") +
						(i == this.summaryEntries.length - 1 ? " last" : "");

					var href = "#" + NDFramePage.currentLocation.path +
									(entry[$Entry_Symbol] != undefined ? ":" + entry[$Entry_Symbol] : "");

					entryHTML.id = "SuEntry" + entry[$Entry_TopicID];
					entryHTML.className = classString;
					entryHTML.setAttribute("href", href);
					entryHTML.innerHTML = "<div class=\"SuEntryIcon\"></div>" + entry[$Entry_NameHTML];
					entryHTML.onmouseover = mouseOverHandler;
					entryHTML.onmouseout = mouseOutHandler;

					// Unfortunately, hovering over the qualifier span in the title counts as moving off the underlying entry.
					// We need to add the event handlers to the qualifier as well.
					var entryHTMLChild = entryHTML.firstChild;

					if (entryHTMLChild != undefined && NDCore.HasClass(entryHTMLChild, "Qualifier"))
						{
						entryHTMLChild.onmouseover = mouseOverHandler;
						entryHTMLChild.onmouseout = mouseOutHandler;
						}

					newContent.appendChild(entryHTML);
					}
				}
			}

		var summaryContainer = document.getElementById("NDSummary");
		var oldContent = document.getElementById("SuContent");

		if (oldContent != undefined)
			{  summaryContainer.replaceChild(newContent, oldContent);  }
		else
			{  summaryContainer.appendChild(newContent);  }

		newContent.scrollIntoView(true);

		// Don't resize on the loading notice to avoid unnecessary jumpiness.
		if (this.summaryEntries != undefined)
			{  NDFramePage.SizeSummaryToContent();  }
		};


	/* Function: FinishNavigation
		In some cases the content iframe can't be set by <NDFramePage.OnHashChange()> because the browser uses
		case-insensitive anchors.  This function will set the iframe in a way that works with them in these situations.
	*/
	this.FinishNavigation = function ()
		{
		if (NDCore.CaseInsensitiveAnchors() &&
			this.summaryEntries != undefined &&
			NDFramePage.currentLocation != undefined &&
			NDFramePage.currentLocation.member != undefined)
			{
			var topicID = -1;

			for (var i = 0; i < this.summaryEntries.length; i++)
				{
				if (this.summaryEntries[i][$Entry_Symbol] == NDFramePage.currentLocation.member)
					{
					topicID = this.summaryEntries[i][$Entry_TopicID];
					break;
					}
				}

			var frame = document.getElementById("CFrame");
			var targetLocation = NDFramePage.currentLocation.contentPage;

			// Replace the symbol anchor with the Topic# anchor.  If we didn't find the entry in the summary, we
			// still want to load the base page.
			var hashIndex = targetLocation.indexOf('#');
			if (hashIndex != -1)
				{  targetLocation = targetLocation.substr(0, hashIndex);  }

			if (topicID != -1)
				{  targetLocation += "#Topic" + topicID;  }

			frame.contentWindow.location = targetLocation;

			// Set focus to the content page iframe so that keyboard scrolling works without clicking over to it.
			frame.contentWindow.focus();
			}
		};


	/* Function: OnEntryMouseOver
	*/
	this.OnEntryMouseOver = function (event)
		{
		if (event == undefined)
			{  event = window.event;  }

		var entry = event.target || event.srcElement;

		if (NDCore.HasClass(entry, "Qualifier"))
			{  entry = entry.parentNode;  }

		var id = this.GetTopicIDFromDOMID(entry.id);

		if (this.showingToolTip != id)
			{
			this.ResetToolTip();
			this.showingToolTip = id;

			if (this.summaryToolTips == undefined)
				{
				// OnToolTipsLoaded() will handle it.
				}
			else if (this.summaryToolTips[id] != undefined)
				{
				// If we're going to display the same tooltip we previously did, skip the delay.  This prevents the
				// tooltip from (visibly) flickering when moving between the qualifier of an entry and the rest of it.
				if (id == this.lastToolTip)
					{
					this.ShowToolTip();
					}

				// Otherwise only show the tooltip on a delay.  This prevents a lot of visual noise when moving the
				// mouse quickly over a summary as tooltips don't pop in and out of existence for split seconds.
				else
					{
					this.toolTipTimeout = setTimeout(function ()
						{
						clearTimeout(this.toolTipTimeout);
						this.toolTipTimeout = undefined;

						NDSummary.ShowToolTip();
						}, $ToolTipDelay);
					}
				}
			}
		};


	/* Function: OnEntryMouseOut
	*/
	this.OnEntryMouseOut = function (event)
		{
		if (event == undefined)
			{  event = window.event;  }

		var entry = event.target || event.srcElement;

		if (NDCore.HasClass(entry, "Qualifier"))
			{  entry = entry.parentNode;  }

		var id = this.GetTopicIDFromDOMID(entry.id);

		if (this.showingToolTip == id)
			{  this.ResetToolTip();  }
		};


	/* Function: GetTopicIDFromDOMID
		Extracts the topic ID from the DOM ID, such as SuEntry123, and returns it as a number.  Returns -1 if it
		couldn't find it.
	*/
	this.GetTopicIDFromDOMID = function (domID)
		{
		// Extract from "SuEntry123".
		var id = parseInt(domID.substr(7), 10);

		if (id != NaN && id > 0)
			{  return id;  }
		else
			{  return -1;  }
		};


	/* Function: ShowToolTip
		Displays the tooltip specified in <showingToolTip>.  Assumes <summaryToolTips> is loaded and an entry already
		exists for <showingToolTip>.
	*/
	this.ShowToolTip = function ()
		{
		var entry = document.getElementById("SuEntry" + this.showingToolTip);

		this.toolTipHolder.innerHTML = this.summaryToolTips[this.showingToolTip];
		this.toolTipHolder.style.visibility = "hidden";
		this.toolTipHolder.style.display = "block";

		// The entry's offsets are relative to the summary block, so we have to add them in.
		var summaryBlock = document.getElementById("NDSummary");

		var x = summaryBlock.offsetLeft + entry.offsetLeft + entry.offsetWidth;
		var y = summaryBlock.offsetTop + entry.offsetTop - summaryBlock.scrollTop;
		var newWidth = undefined;
		var maxWidth = window.innerWidth - x - $ToolTipRightEdgeMargin;

		if (this.toolTipHolder.offsetWidth > maxWidth)
			{  newWidth = maxWidth;  }
		// Otherwise leave undefined.

		this.toolTipHolder.style.left = x + "px";
		this.toolTipHolder.style.top = y + "px";

		if (newWidth != undefined)
			{  this.toolTipHolder.style.width = newWidth + "px";  }

		// Switch prototype styles if it's getting clipped.
		var prototypes = this.toolTipHolder.getElementsByClassName("NDPrototype");
		if (prototypes.length > 0 && NDCore.HasClass(prototypes[0], "WideForm") &&
			prototypes[0].scrollWidth > prototypes[0].offsetWidth)
			{
			NDCore.ChangePrototypeToNarrowForm(prototypes[0]);
			}

		// Make sure the bottom doesn't go off the visible page.  We do this in a separate step because
		// setting the width may have changed the height due to wrapping.
		if (y + this.toolTipHolder.offsetHeight + $ToolTipBottomEdgeMargin > window.innerHeight)
			{
			var newY = window.innerHeight - this.toolTipHolder.offsetHeight - $ToolTipBottomEdgeMargin;

			if (newY < 0)
				{  newY = 0;  }

			this.toolTipHolder.style.top = newY + "px";
			}

		this.toolTipHolder.style.visibility = "visible";
		};


	/* Function: ResetToolTip
	*/
	this.ResetToolTip = function ()
		{
		if (this.showingToolTip != undefined)
			{
			this.toolTipHolder.style.display = "none";

			// Reset the width.  It may have been set to make sure the tooltip fits entirely inside the window.
			// We want to allow it to get bigger if the window has more room again.
			this.toolTipHolder.style.width = null;

			this.lastToolTip = this.showingToolTip;
			this.showingToolTip = undefined;
			}

		if (this.toolTipTimeout != undefined)
			{
			clearTimeout(this.toolTipTimeout);
			this.toolTipTimeout = undefined;
			}
		};



	// Group: Variables
	// ________________________________________________________________________


	/* var: summaryLanguages
	*/

	/* var: summaryCommentTypes
	*/

	/* var: summaryEntries
	*/

	/* var: summaryToolTips
		A hash mapping topic IDs to the complete HTML of the tooltip.
	*/

	/* var: showingToolTip
		The topic ID of the tooltip being displayed, or undefined if none.
	*/

	/* var: lastToolTip
		The topic ID of the tooltip that was last shown.  Only relevant when <showingToolTip> is undefined.
	*/

	/* var: toolTipHolder
		The DOM element which contains the tooltip.  If none is being shown it will exist but be set to
		display: none.
	*/

	/* var: toolTipTimeout
		The timeout used to display the tooltip.
	*/

	/* var: delayedLoadingTimeout
		The timeout used to avoid displaying the loading notification on short transitions.
	*/
	};
