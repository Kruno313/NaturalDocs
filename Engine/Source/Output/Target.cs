﻿/* 
 * Class: CodeClear.NaturalDocs.Engine.Output.Target
 * ____________________________________________________________________________
 * 
 * The base class for an output target.
 */

// This file is part of Natural Docs, which is Copyright © 2003-2020 Code Clear LLC.
// Natural Docs is licensed under version 3 of the GNU Affero General Public License (AGPL)
// Refer to License.txt for the complete details


using System;
using System.IO;
using CodeClear.NaturalDocs.Engine.Styles;


namespace CodeClear.NaturalDocs.Engine.Output
	{
	abstract public class Target : Module
		{
		
		// Group: Functions
		// __________________________________________________________________________
		
		
		/* Function: Target
		 */
		public Target (Output.Manager manager) : base (manager.EngineInstance)
			{
			this.manager = manager;
			}
			
		
		/* Function: Start
		 * Initializes the target and returns whether all the settings are correct and that execution is ready to begin.  
		 * If there are problems they are added as <Errors> to the errorList parameter.
		 */
		virtual public bool Start (Errors.ErrorList errorList)
			{  
			return true;
			}
			
			
		/* Function: WorkOnUpdatingOutput
		 * 
		 * Works on the task of updating the output files for any changes it has detected so far.  This is a parallelizable task, so
		 * multiple threads can call this function and the work will be divided up between them.  Note that the output may not be
		 * usable after this completes; you also need to call <WorkOnFinalizingOutput()>.
		 * 
		 * This function returns if it's cancelled or there is no more work to be done.  If there is only one thread working on this 
		 * then the task is complete, but if there are multiple threads the task isn't complete until they all have returned.  This one 
		 * may have returned because there was no more work for this thread to do, but other threads are still working.
		 */
		abstract public void WorkOnUpdatingOutput (CancelDelegate cancelDelegate);

			
		/* Function: WorkOnFinalizingOutput
		 * 
		 * Works on the task of finalizing the output, which is any task that requires all files to be successfully processed by
		 * <WorkOnUpdatingOutput()> before it can run.  You must wait for all threads to return from <WorkOnUpdatingOutput()>
		 * before calling this function.  Examples of finalization include generating index and search data for HTML output and
		 * compiling the temporary files into the final one for PDF output.  This is a parallelizable task, so multiple threads can call 
		 * this function and the work will be divided up between them.
		 * 
		 * This function returns if it's cancelled or there is no more work to be done.  If there is only one thread working on this 
		 * then the task is complete, but if there are multiple threads the task isn't complete until they all have returned.  This one 
		 * may have returned because there was no more work for this thread to do, but other threads are still working.
		 */
		virtual public void WorkOnFinalizingOutput (CancelDelegate cancelDelegate)
			{
			}


		/* Function: Cleanup
		 * Cleans up the target's internal data when everything is up to date.  The default implementation does nothing.  You
		 * can pass a <CancelDelegate> to interrupt the process if necessary.
		 */
		virtual public void Cleanup (CancelDelegate cancelDelegate)
			{
			}


		/* Function: UnitsOfWorkRemaining
		 * Returns a number representing how much work the builder has left to do.  Building the HTML output for a single source 
		 * file is counted as 10 units so everything else should be scored relative to that.
		 */
		abstract public long UnitsOfWorkRemaining ();



		// Group: Properties
		// __________________________________________________________________________


		/* Property: Manager
		 * The <Output.Manager> associated with this target.
		 */
		public Output.Manager Manager
			{
			get
				{  return manager;  }
			}


		/* Property: Style
		 * The <Style> that applies to this target, or null if none.
		 */
		virtual public Style Style
			{
			get
				{  return null;  }
			}



		// Group: Variables
		// __________________________________________________________________________

		protected Output.Manager manager;

		}
	}