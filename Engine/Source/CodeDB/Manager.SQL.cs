﻿/* 
 * Class: GregValure.NaturalDocs.Engine.CodeDB.Manager
 */

// This file is part of Natural Docs, which is Copyright © 2003-2012 Greg Valure.
// Natural Docs is licensed under version 3 of the GNU Affero General Public License (AGPL)
// Refer to License.txt for the complete details


using System;
using System.Collections.Generic;


namespace GregValure.NaturalDocs.Engine.CodeDB
	{
	public partial class Manager
		{		
		
		/* Function: CreateDatabase
		 * Assumes the database is completely empty, not just of data but of table definitions too, and initializes it.
		 * Also initializes the system variables so you don't have to call <LoadSystemVariables()> afterwards.
		 */
		protected void CreateDatabase ()
			{
			connection.Execute("CREATE TABLE System (Version TEXT NOT NULL, " +
																							"UsedTopicIDs TEXT NOT NULL, " +
																							"UsedLinkIDs TEXT NOT NULL, " +
																							"UsedClassIDs TEXT NOT NULL, " +
																							"UsedContextIDs TEXT NOT NULL )");
			
			connection.Execute("INSERT INTO System (Version, UsedTopicIDs, UsedLinkIDs, UsedClassIDs, UsedContextIDs) VALUES (?,?,?,?,?)", 
												Engine.Instance.VersionString, IDObjects.NumberSet.EmptySetString, IDObjects.NumberSet.EmptySetString,
												IDObjects.NumberSet.EmptySetString, IDObjects.NumberSet.EmptySetString);
			usedTopicIDs.Clear();
			usedLinkIDs.Clear();
			usedClassIDs.Clear();
			usedContextIDs.Clear();
			
			
			connection.Execute("CREATE TABLE Topics (TopicID INTEGER PRIMARY KEY NOT NULL, " +
																							"Title TEXT NOT NULL, " +
																							"Body TEXT, " +
																							"Summary TEXT, " +
																							"Prototype TEXT, " +
																							"Symbol TEXT NOT NULL, " +
																							"SymbolDefinitionNumber INTEGER NOT NULL, " +
																							"ClassID INTEGER NOT NULL, " +
																							"IsEmbedded INTEGER NOT NULL, " +
																							"EndingSymbol TEXT NOT NULL, " +
																							"TopicTypeID INTEGER NOT NULL, " +
																							"AccessLevel INTEGER NOT NULL, " +
																							"Tags TEXT, " +
																							"FileID INTEGER NOT NULL, " +
																							"CommentLineNumber INTEGER NOT NULL, " +
																							"CodeLineNumber INTEGER NOT NULL, " +
																							"LanguageID INTEGER NOT NULL, " +
																							"PrototypeContextID INTEGER NOT NULL, " +
																							"BodyContextID INTEGER NOT NULL )");
																	   
			connection.Execute("CREATE INDEX TopicsByFile ON Topics (FileID, CommentLineNumber)");
			connection.Execute("CREATE INDEX TopicsByClass ON Topics (ClassID)");
			connection.Execute("CREATE INDEX TopicsByEndingSymbol ON Topics (EndingSymbol)");


			connection.Execute("CREATE TABLE Links (LinkID INTEGER PRIMARY KEY NOT NULL, " +
																						"Type INTEGER NOT NULL, " +
																						"TextOrSymbol TEXT NOT NULL, " +
																						"ContextID INTEGER NOT NULL, " +
																						"FileID INTEGER NOT NULL, " +
																						"LanguageID INTEGER NOT NULL, " +
																						"EndingSymbol TEXT NOT NULL, " +
																						"TargetTopicID INTEGER NOT NULL, " +
																						"TargetScore INTEGER NOT NULL )");
																	   
			connection.Execute("CREATE UNIQUE INDEX LinksByProperties ON Links (FileID, ContextID, Type, LanguageID, TextOrSymbol)");
			connection.Execute("CREATE INDEX LinksByEndingSymbols ON Links (EndingSymbol)");
			connection.Execute("CREATE INDEX LinksByTargetTopicID ON Links (TargetTopicID)");


			connection.Execute("CREATE TABLE AlternateLinkEndingSymbols (LinkID INTEGER NOT NULL, " +
																																"EndingSymbol TEXT NOT NULL, " +
																																"PRIMARY KEY (LinkID, EndingSymbol) )");
																	   
			connection.Execute("CREATE INDEX AlternateLinkEndingSymbolsBySymbol ON AlternateLinkEndingSymbols (EndingSymbol)");


			connection.Execute("CREATE TABLE Classes (ClassID INTEGER PRIMARY KEY NOT NULL, " +
																							"Hierarchy INTEGER NOT NULL, " +
																							"LanguageID INTEGER NOT NULL, " +
																							"Symbol TEXT NOT NULL, " +
																							"ReferenceCount INTEGER NOT NULL )");
																	   
			connection.Execute("CREATE INDEX ClassesByHierarchyAndSymbol ON Classes (Hierarchy, Symbol)");


			connection.Execute("CREATE TABLE Contexts (ContextID INTEGER PRIMARY KEY NOT NULL, " +
																							  "ContextString TEXT NOT NULL, " +
																							  "ReferenceCount INTEGER NOT NULL )");
																	   
			connection.Execute("CREATE INDEX ContextsByContextString ON Contexts (ContextString)");
			}


		/* Function: GetVersion
		 * Retrieves the database version.
		 */
		protected Version GetVersion ()
			{
			using (SQLite.Query query = connection.Query("SELECT Version FROM System"))
				{
				query.Step();			
				return new Version( query.StringColumn(0) );
				}
			}
			
			
		/* Function: LoadSystemVariables
		 * 
		 * Retrieves various system variables from the database.  This currently includes:
		 * 
		 *		- <UsedTopicIDs>
		 *		- <UsedLinkIDs>
		 *		- <UsedClassIDs>
		 *		- <UsedContextIDs>
		 */
		protected void LoadSystemVariables ()
			{
			using (SQLite.Query query = connection.Query("SELECT UsedTopicIDs, UsedLinkIDs, UsedClassIDs, UsedContextIDs from System"))
				{
				query.Step();
				
				usedTopicIDs = IDObjects.NumberSet.FromString( query.StringColumn(0) );
				usedLinkIDs = IDObjects.NumberSet.FromString( query.StringColumn(1) );
				usedClassIDs = IDObjects.NumberSet.FromString( query.StringColumn(2) );
				usedContextIDs = IDObjects.NumberSet.FromString( query.StringColumn(3) );
				}
			}
			
			
		/* Function: SaveSystemVariablesAndVersion
		 * Saves various system variables to the database, as well as setting the version variable to the current version.
		 */
		protected void SaveSystemVariablesAndVersion ()
			{
			connection.Execute("UPDATE System SET Version=?, UsedTopicIDs=?, UsedLinkIDs=?, UsedClassIDs=?, UsedContextIDs=?", 
												Engine.Instance.VersionString, usedTopicIDs.ToString(), usedLinkIDs.ToString(), usedClassIDs.ToString(),
												usedContextIDs.ToString());
			}
			
		}
	}