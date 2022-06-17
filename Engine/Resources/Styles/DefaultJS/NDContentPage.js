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


$ToolTipDelay = 350;
$ToolTipVerticalOffset = 3;
$ToolTipHorizontalOffset = 8;
$ToolTipHorizontalMargin = 5;
$ToolTipHorizontalMarginX2 = 10;
$ToolTipBottomMargin = 25;  /* leave space for link address pop-up */

"use strict";


/* Class: NDContentPage
	_____________________________________________________________________________

*/
var NDContentPage = new function ()
	{

	// Group: Functions
	// ________________________________________________________________________


	/* Function: Start
	*/
	this.Start = function ()
		{

		// Apply the theme

		var themeID = NDCore.GetQueryParam('Theme');

		if (themeID != undefined)
			{  NDThemes.Apply(themeID);  }


		// Set up event listener

		window.addEventListener("message", this.OnMessage);


		// Resize prototypes to better fit the window.

		this.CalculateWideFormPrototypeWidths();

		// Firefox will sometimes execute Start() too early and all the prototype widths will be zero.
		// Check the widths, and if any of them are zero quit and retry a little later.
		for (var key in this.wideFormPrototypeWidths)
			{
			if (this.wideFormPrototypeWidths[key] == 0)
				{
				setTimeout("NDContentPage.Start();", 200);
				return;
				}
			}

		this.ReformatPrototypes();

		window.onresize = function () {  NDContentPage.OnResize();  };


		// Create the tooltip holder.

		this.toolTipHolder = document.createElement("div");
		this.toolTipHolder.style.display = "none";
		this.toolTipHolder.style.position = "fixed";
		this.toolTipHolder.style.zIndex = 20;  // documented in default.css
		document.body.appendChild(this.toolTipHolder);


		// Load the tool tips

		var ttLocation = location.href;

		var queryIndex = ttLocation.indexOf('?');
		if (queryIndex != -1)
			{  ttLocation = ttLocation.substr(0, queryIndex);  }
		else
			{
			var hashIndex = ttLocation.indexOf('#');
			if (hashIndex != -1)
				{  ttLocation = ttLocation.substr(0, hashIndex);  }
			}

		// Replace .html with -ToolTips.js
		ttLocation = ttLocation.substr(0, ttLocation.length - 5) + "-ToolTips.js";

		NDCore.LoadJavaScript(ttLocation);
		};


	/* Function: OnResize
	*/
	this.OnResize = function ()
		{
		// Limit reformatting to avoid unnecessary CPU usage.  Some pages may have a lot of prototypes.  However, don't reset
		// the timeout on each event because otherwise we have to wait until the user completely stops dragging.
		if (this.reformatPrototypesTimeout == undefined)
			{
			this.reformatPrototypesTimeout = setTimeout("NDContentPage.ReformatPrototypes()", 200);
			}
		};


	/* Function: OnMessage

		Event handler for messages sent to this page by the frame page via postMessage().

		Supported Commands:

			NoTheme - Remove any theme classes.
			Theme=[id] - Apply the passed theme ID.
	*/
	this.OnMessage = function (event)
		{
		var message = event.data;

		if (message == "NoTheme")
			{  NDThemes.Apply(undefined);  }
		else if (message.StartsWith("Theme="))
			{
			var theme = message.slice(6);
			NDThemes.Apply(theme);
			}
		};



	// Group: Prototype Functions
	// ________________________________________________________________________


	/* Function: GetPrototypeIDNumber
		Returns the prototype ID number in numeric form (234 for "Prototype234") for the passed element, or -1 if it can't be found.
	*/
	this.GetPrototypeIDNumber = function (element)
		{
		if (element.id.indexOf("NDPrototype") == 0)
			{
			// Extract 234 from "NDPrototype234".
			var id = parseInt(element.id.substr(11), 10);

			if (id != NaN && id > 0)
				{  return id;  }
			}

		return -1;
		};


	/* Function: CalculateWideFormPrototypeWidths
		Goes through all the wide form prototypes and records their widths into <wideFormPrototypeWidths>.
	*/
	this.CalculateWideFormPrototypeWidths = function ()
		{
		var prototypes = document.getElementsByClassName("NDPrototype");

		for (var i = 0; i < prototypes.length; i++)
			{
			if (NDCore.HasClass(prototypes[i], "WideForm"))
				{
				var id = this.GetPrototypeIDNumber(prototypes[i]);

				if (id != -1)
					{
					var tables = prototypes[i].getElementsByTagName("table");
					var maxWidth = 0;

					for (var t = 0; t < tables.length; t++)
						{
						var tableWidth = tables[t].offsetWidth;

						if (tableWidth > maxWidth)
							{  maxWidth = tableWidth;  }
						}

					this.wideFormPrototypeWidths[id] = maxWidth;
					}
				}
			}
		};


	/* Function: ReformatPrototypes
		Switches each prototype between the wide and narrow form depending on the amount of space it has.
	*/
	this.ReformatPrototypes = function ()
		{
		var prototypes = document.getElementsByClassName("NDPrototype");

		for (var i = 0; i < prototypes.length; i++)
			{
			var id = this.GetPrototypeIDNumber(prototypes[i]);

			if (id == -1)
				{  continue;  }

			var wideFormWidth = this.wideFormPrototypeWidths[id];

			if (wideFormWidth == null || wideFormWidth <= 0)
				{  continue;  }

			var availableWidth = prototypes[i].offsetWidth;

			// availableWidth includes padding, so remove it by comparing its offset to its child's.
			// We can only get the left padding so assume the right is the same and double it.
			availableWidth -= (prototypes[i].firstChild.offsetLeft - prototypes[i].offsetLeft) * 2;

			// Remove an extra pixel since some browsers add the scrollbar when they're exactly equal.
			availableWidth--;

			if (availableWidth >= wideFormWidth && NDCore.HasClass(prototypes[i], "NarrowForm"))
				{  NDCore.ChangePrototypeToWideForm(prototypes[i]);  }
			else if (availableWidth < wideFormWidth && NDCore.HasClass(prototypes[i], "WideForm"))
				{  NDCore.ChangePrototypeToNarrowForm(prototypes[i]);  }
			}

		if (this.reformatPrototypesTimeout != undefined)
			{
			clearTimeout(this.reformatPrototypesTimeout);
			this.reformatPrototypesTimeout = undefined;
			}
		};


	/* Function: ShowAdditionalChildren
		Displays additional children in class prototypes when the notice is clicked.
	*/
	this.ShowAdditionalChildren = function (prototypeID)
		{
		var prototype = document.getElementById(prototypeID);

		var notice = prototype.getElementsByClassName("CPAdditionalChildrenNotice")[0];
		var additionalChildren = prototype.getElementsByClassName("CPAdditionalChildren", "div")[0];

		notice.style.display = "none";
		additionalChildren.style.display = "block";
		};



	// Group: Tool Tip Functions
	// ________________________________________________________________________


	/* Function: OnToolTipsLoaded
	*/
	this.OnToolTipsLoaded = function (toolTips)
		{
		this.toolTips = toolTips;

		if (this.showingToolTip != undefined && this.toolTips[this.showingToolTip] != undefined)
			{  this.ShowToolTip();  }
		};


	/* Function: OnLinkMouseOver
	*/
	this.OnLinkMouseOver = function (event, toolTipID)
		{
		var domLink = event.target || event.srcElement;

		if (this.showingToolTip != toolTipID)
			{
			this.ResetToolTip();
			this.showingToolTip = toolTipID;
			this.domLinkShowingToolTip = domLink;

			if (this.toolTips == undefined)
				{
				// OnToolTipsLoaded() will handle it.
				}
			else if (this.toolTips[toolTipID] != undefined)
				{
				this.toolTipTimeout = setTimeout(function ()
					{
					clearTimeout(this.toolTipTimeout);
					this.toolTipTimeout = undefined;

					NDContentPage.ShowToolTip();
					}, $ToolTipDelay);
				}
			}
		};


	/* Function: OnLinkMouseOut
	*/
	this.OnLinkMouseOut = function (event)
		{
		var domLink = event.target || event.srcElement;

		if (this.domLinkShowingToolTip == domLink)
			{  this.ResetToolTip();  }
		};


	/* Function: ShowToolTip
		Displays the tooltip specified in <showingToolTip>.  Assumes <toolTips> is loaded and an entry already
		exists for <showingToolTip>.
	*/
	this.ShowToolTip = function ()
		{
		this.toolTipHolder.innerHTML = this.toolTips[this.showingToolTip];
		this.toolTipHolder.style.visibility = "hidden";
		this.toolTipHolder.style.display = "block";

		// We need to reset the x position so that width measurements are taken correctly.
		this.toolTipHolder.style.left = "0px";

		// In Firefox and IE, scrollTop is applied to the html node (document.body.parentNode).
		// In Chrome, scrollTop is applied to document.body.
		var scrollParent = document.body;
		if (scrollParent.scrollTop == 0)
			{  scrollParent = scrollParent.parentNode;  }

		var linkOffsets = NDCore.GetFullOffsets(this.domLinkShowingToolTip);

		var x = linkOffsets.offsetLeft - $ToolTipHorizontalOffset;
		var y = linkOffsets.offsetTop + this.domLinkShowingToolTip.offsetHeight - scrollParent.scrollTop + $ToolTipVerticalOffset;
		var newWidth = undefined;

		// If the horizontal offset pushed it too far to the left, shift it right.
		if (x < $ToolTipHorizontalMargin)
			{  x = $ToolTipHorizontalMargin;  }

		// If the tooltip goes off the edge of the page, shift it left.
		if (x + this.toolTipHolder.offsetWidth + $ToolTipHorizontalMargin > document.body.offsetWidth)
			{
			x = document.body.offsetWidth - this.toolTipHolder.offsetWidth - $ToolTipHorizontalMargin;

			// If x is now too large for the page, force it to the page width.
			if (x < $ToolTipHorizontalMargin)
				{
				x = $ToolTipHorizontalMargin;
				newWidth = document.body.offsetWidth - $ToolTipHorizontalMarginX2;
				}
			}
		// Otherwise leave newWidth undefined.

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

		// If we can't fit the tooltip on the page underneath the link, see if we can do it above.  We only do this
		// if the whole thing can fit though.  It's better to have just the top part than the bottom part.
		// Chrome, IE, and Firefox all use the html element here (document.body.parentNode).
		if (y + this.toolTipHolder.offsetHeight + $ToolTipBottomMargin > document.body.parentNode.offsetHeight)
			{
			var newY = linkOffsets.offsetTop - this.toolTipHolder.offsetHeight - scrollParent.scrollTop - $ToolTipVerticalOffset;

			if (newY >= $ToolTipVerticalOffset)
				{
				this.toolTipHolder.style.top = newY + "px";
				}
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


	/* var: wideFormPrototypeWidths
		Maps prototype ID numbers to the pixel widths of their wide form.
	*/
	this.wideFormPrototypeWidths = { };

	/* var: reformatPrototypesTimeout
		The ID of the prototype reflow timeout if one is running.
	*/

	/* var: toolTips
		A hash mapping topic IDs to the complete HTML of the tooltip.  Will be undefined if they haven't
		been loaded yet.
	*/

	/* var: showingToolTip
		The topic ID of the tooltip being displayed, or undefined if none.
	*/

	/* var: domLinkShowingToolTip
		If <showingToolTip> is true, this is the DOM element doing it.
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

	};
