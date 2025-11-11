//
//  SeedJavaScriptEngine.js
//  ALP
//
//  Created by Dheeraj Goswami on 7/8/13.
//  Copyright (c) 2013 Apple Inc. All rights reserved.
//

function appendStyles(rule) {
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = rule;
    document.body.appendChild(css)
}

function appendScript(script) {
    var element = document.createElement("script");
    element.type = "text/javascript";
    element.innerHTML = script;
    document.body.appendChild(element);
}

var SeedCallbacks = SeedCallbacks || {

    // generates a unique function name to be used to hold onto anonymous functions passed to SEED JS APIs
    guidFunctionName: function() {
    
        // adapted from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
        return 'callbackxxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
        
    },

    // adds an anonymous function to the class and returns the generated method name
    add: function(callback) {
    
        var functionName = SeedCallbacks.guidFunctionName();
        SeedCallbacks[functionName] = callback;
        return functionName;
        
    }
    
};

var SeedAPI = SeedAPI || {
    
    asset: function(partNumber, callback) {
    
        window.webkit.messageHandlers.asset.postMessage({'partNumber': partNumber, 'callbackName': SeedCallbacks.add(callback)});
        
    },
    
};

var Seed = Seed || {};

/****************************************************/
/* Common APIs used for various tasks by the engine */
/****************************************************/
Seed.submitRequest = function(api)
{
    window.webkit.messageHandlers.api.postMessage({'api': api});
}


Seed.reportError = function(error)
{
    alert(error);
}


Seed.postErrorMessage = function (message)
{
    var attributes = {};
    attributes.message = message;
    this.submit("/seed/postErrorMessage/", attributes);
}


Seed.handleFileLink = function (url)
{
    var attributes = {};
    attributes.url = url;
    attributes.locationX = Seed.cachedX;
    attributes.locationY = Seed.cachedY;
    this.submit("/seed/handleFileLink/", attributes);
}


Seed.showTOS = function()
{
    this.submit("/seed/showTOS");
}

Seed.showPrivacyPolicy = function()
{
    window.webkit.messageHandlers.api.postMessage({'privacyPolicy': "/seed/showPrivacyPolicy"});
}

Seed.ping = function()
{
    alert("Ping success!");
}


/***************************************
 * Callbacks based initialization APIs *
 ***************************************/
Seed.metadata;
Seed.assessments;

Seed.getMetadata = function()
{
    return this.metadata;
}


Seed.getAssessments = function()
{
    return this.assessments;
}


Seed.defaultAssessmentsInitSuccessCallback = function(metadata, assessments)
{
    this.metadata = metadata;
    this.assessments = assessments;
}


Seed.defaultAssessmentsInitFailureCallback = function(error)
{
    alert('Assessment init failed: ' + error);
}


Seed.callNativeFunction = function(identifier, args, showAnswers, successCallback, failureCallback)
{
    var value = {};

    value.functionname = "initAssessments";
    
    if (identifier) {
        value.identifier = identifier;
    }
    
    if (successCallback) {
        value.successCallback = successCallback;
    } else {
        value.successCallback = "Seed.defaultAssessmentsInitSuccessCallback";
    }
    
    
    if (failureCallback) {
        value.failureCallback = failureCallback;
    } else {
        value.failureCallback = "Seed.defaultAssessmentsInitFailureCallback";
    }
    
    if (args) {
        value.args = args;
    }
    
    value.showAnswers = showAnswers;
    
    var path = "/seed/init/" + encodeURIComponent(JSON.stringify(value));
    this.submitRequest(path);
}


Seed.AssessmentType = {
    QUIZ : "QUIZ",
    SURVEY : "SURVEY",
    POLL : "POLL"
}


Seed.submit = function (url, attributes)
{
    var attributesComponent = '';
    if (attributes) {
        attributesComponent = JSON.stringify(attributes);
    }
    var path = url + encodeURIComponent(attributesComponent);
    this.submitRequest(path);
}


/**********************************************************************************************************/
/* User details Initialization APIs                                                                       */
/* successCallback must take 4 JSON argument: userID, userName, userLocale array of audience dictionaries */
/* failureCallback must take 1 String arugument: error                                                    */
/**********************************************************************************************************/
Seed.initUserDetailsWithCallbacks = Seed.initUserDetailsWithCallback = function (identifier, successCallback, failureCallback)
{
    if (typeof identifier != "number") {
        failureCallback = successCallback;
        successCallback = identifier;
        identifier = 0;
    }
    var value = {};
    value.functionname = "initUserDetails";
    value.successCallback = successCallback;
    value.failureCallback = failureCallback;
    value.identifier = identifier;
    this.submit("/seed/inituserdetails/", value);
}

Seed.initProgramDetailsWithCallbacks = function (identifier, successCallback, failureCallback)
{
    if (typeof identifier != "number") {
        failureCallback = successCallback;
        successCallback = identifier;
        identifier = 0;
    }
    var value = {};
    value.functionname = "initProgramDetails";
    value.successCallback = successCallback;
    value.failureCallback = failureCallback;
    value.identifier = identifier;
    this.submit("/seed/initProgramDetails/", value);
}

Seed.joinProgramRequestWithCallbacks = function (identifier, successCallback, failureCallback) {
    if (typeof identifier != "number") {
        failureCallback = successCallback;
        successCallback = identifier;
        identifier = 0;
    }
    
    var program = JSON.parse(localStorage.getItem('program'))
    
    var attributes = {
        "identifier": identifier,
        "successCallback": successCallback,
        "failureCallback": failureCallback,
        "orionProgramID": program["orionProgramID"],
        "storeAppleID": program["storeAppleID"],
        "programTitle": program["programTitle"],
        "levelTitle": program["levelTitle"]
    };
    
    this.submit("/seed/joinProgram/", attributes);
}

Seed.leaveProgramRequestWithCallbacks = function (identifier, successCallback, failureCallback) {
    if (typeof identifier != "number") {
        failureCallback = successCallback;
        successCallback = identifier;
        identifier = 0;
    }
    
    var program = JSON.parse(localStorage.getItem('program'))

    var attributes = {
        "identifier": identifier,
        "successCallback": successCallback,
        "failureCallback": failureCallback,
        "orionProgramID": program["orionProgramID"],
        "storeAppleID": program["storeAppleID"],
        "programTitle": program["programTitle"],
        "levelTitle": program["levelTitle"]
    };
    
    this.submit("/seed/leaveProgram/", attributes);
}
//Event Metadata
Seed.getEventMetadataWithCallbacks = function (identifier, successCallback, failureCallback) {
    var attributes = {
        "identifier": identifier,
        "successCallback": successCallback,
        "failureCallback": failureCallback
    };
    this.submit("/seed/getEventMetadata/", attributes);
}

//Embadded Video Continuation
 Seed.fetchVideoOffsetWithCallbacks = function (identifier, viewerID, videoIDs, successCallback, failureCallback) {
     var attributes = {
         "identifier": identifier,
         "viewerID": viewerID,
         "videoIDs":videoIDs,
         "successCallback": successCallback,
         "failureCallback": failureCallback
     };
   this.submit("/seed/fetchVideoOffset/", attributes);
 }

//Digital rewards code redemption APIs
Seed.getRewardCodeWithCallbacks = function (identifier, campaignGroupUUID, successCallback, failureCallback) {
    var attributes = {
        "identifier": identifier,
        "campaignGroupUUID": campaignGroupUUID,
        "successCallback": successCallback,
        "failureCallback": failureCallback
    };
    this.submit("/seed/getRewardCode/", attributes);
}

Seed.checkIsRewardCodeGeneratedWithCallbacks = function (identifier, campaignGroupUUID, successCallback, failureCallback) {
    var attributes = {
        "identifier": identifier,
        "campaignGroupUUID": campaignGroupUUID,
        "successCallback": successCallback,
        "failureCallback": failureCallback
    };
    this.submit("/seed/checkIsRewardCodeGenerated/", attributes);
}

// Media upload APIs

Seed.initMediaUploadWithCallbacks = function (identifier, successCallback, failureCallback) {

    var uploadLink = JSON.parse(localStorage.getItem('uploadLink'))

    var attributes = {
        "identifier": identifier,
        "uploadLinkID": uploadLink["uploadLinkID"],
        "entityID": uploadLink["entityID"],
        "entityType": uploadLink["entityType"],
        "successCallback": successCallback,
        "failureCallback": failureCallback
    };
    
    this.submit("/seed/initMediaUpload/", attributes);
}

Seed.presentTC = function (muPartNumber) {

    var attributes = {
        "partNumber": muPartNumber
    };
    
    this.submit("/seed/mediaUpload/presentTC/", attributes);
}

Seed.uploadMediaWithCallbacks = function (identifier, partNumber, menuX, menuY, successCallback, failureCallback) {

    var uploadLink = JSON.parse(localStorage.getItem('uploadLink'))

    var attributes = {
        "identifier": identifier,
        "partNumber": partNumber,
        "menuX": menuX,
        "menuY": menuY,
        "successCallback": successCallback,
        "failureCallback": failureCallback,
        "uploadLinkID": uploadLink["uploadLinkID"],
        "entityID": uploadLink["entityID"],
        "entityType": uploadLink["entityType"]
    };
    
    this.submit("/seed/mediaUpload/presentUpload/", attributes);
}

Seed.presentMediaAttachmentsWithCallback = function (identifier, partNumber, successCallback) {
    
    var uploadLink = JSON.parse(localStorage.getItem('uploadLink'))

    var attributes = {
        "identifier": identifier,
        "partNumber": partNumber,
        "successCallback": successCallback,
        "uploadLinkID": uploadLink["uploadLinkID"],
        "entityID": uploadLink["entityID"],
        "entityType": uploadLink["entityType"],
    };
    
    this.submit("/seed/mediaUpload/presentAttachments/", attributes);
}


Seed.fetchMetadataForEntitiesWithCallbacks = function (identifier, data, successCallback, failureCallback)
{
    var value = {};
    value.functionname = "fetchMetadataForEntities";
    value.successCallback = successCallback;
    value.failureCallback = failureCallback;
    value.identifier = identifier;
    value.data = data;
    this.submit("/seed/initUserEntity/metadataDetails/", value);
}

Seed.getDeviceInfoWithCallbacks = function(identifier, successCallback, failureCallback)
{
    var value = {};
    value.functionname = "fetchDeviceInfo";
    value.successCallback = successCallback;
    value.failureCallback = failureCallback;
    value.identifier = identifier;
    this.submit("/seed/fetchDeviceInfo/", value);
}


/**************************************************************************/
/* Accessible Assets Initialization APIs                                  */
/* successCallback must take 1 JSON argument: array of asset dictionaries */
/* failureCallback must take 1 String arugument: error                    */
/**************************************************************************/
Seed.initAccessibleAssetsWithCallbacks = Seed.initAccessibleAssetsWithCallback = function (identifier, successCallback, failureCallback)
{
    if (typeof identifier != "number") {
        failureCallback = successCallback;
        successCallback = identifier;
        identifier = 0;
    }
    var value = {};
    value.functionname = "initAccessibleAssets";
    value.successCallback = successCallback;
    value.failureCallback = failureCallback;
    value.identifier = identifier;
    this.submit("/seed/initaccessibleassets/", value);
}


/********************************************************************/
/* Assessment Initialization APIs                                   */
/* successCallback must take 2 JSON argument: metadata, assessments */
/* failureCallback must take 1 String arugument: error              */
/********************************************************************/

Seed.initAssessmentsWithArgsAndCallbacks = function(identifier, args, successCallback, failureCallback)
{
    if (typeof identifier != "number") {
        failureCallback = successCallback;
        successCallback = args;
        args = identifier;
        identifier = 0;
    }
    this.callNativeFunction(identifier, args, null, successCallback, failureCallback);
}


Seed.initAssessmentsWithArgs = function(args)
{
    this.callNativeFunction(null, args, null, null, null);
}


Seed.initAssessmentsWithCallbacks = function(identifier, showAnswers, successCallback, failureCallback)
{
    if (typeof identifier != "number") {
        failureCallback = successCallback;
        successCallback = showAnswers;
        showAnswers = identifier;
        identifier = 0;
    }
    this.callNativeFunction(identifier, null, showAnswers, successCallback, failureCallback);
}


Seed.initAssessments = function()
{
    this.callNativeFunction(null, null, null, null, null);
}


/*********************************************************************************/
/* Assessment Submit APIs                                                        */
/* successCallback must take 2 arguments: assessmentID, result                   */
/* failureCallback must take 3 aruguments: assessmentID, errorCode, errorMessage */
/*********************************************************************************/

Seed.submitAssessmentWithCallbacks = function (identifier, type, assessmentID, json, suppressCompletion, successCallback, failureCallback)
{
    if (typeof identifier != "number") {
        failureCallback = successCallback;
        successCallback = suppressCompletion;
        suppressCompletion = json;
        json = assessmentID;
        assessmentID = type;
        type = identifier;
        identifier = 0;
        
        if (typeof suppressCompletion != "boolean") {
            failureCallback = suppressCompletion;
            successCallback = json;
            suppressCompletion = false;
        }
    } else if (typeof suppressCompletion != "boolean") {
        failureCallback = successCallback;
        successCallback = suppressCompletion;
        suppressCompletion = false;
    }

    if (type != this.AssessmentType.QUIZ && type != this.AssessmentType.SURVEY && type != this.AssessmentType.POLL) {
        alert("Invalid assessment type : " + type);
    } else if (!assessmentID) {
        alert("Invalid assessment ID : " + assessmentID);
    } else {
        var attributes = {};
        attributes.type = type;
        attributes.assessmentID = assessmentID;
        attributes.json = json;
        attributes.successCallback = successCallback;
        attributes.failureCallback = failureCallback;
        attributes.identifier = identifier;
        attributes.suppressCompletion = suppressCompletion
        this.submit("/seed/submit/assessment/", attributes);
    }
}


Seed.submitAssessment = function (type, assessmentID, json)
{
    if (type != this.AssessmentType.QUIZ && type != this.AssessmentType.SURVEY && type != this.AssessmentType.POLL) {
        alert("Invalid assessment type : " + type);
    } else if (!assessmentID) {
        alert("Invalid assessment ID : " + assessmentID);
    } else {
        var attributes = {};
        attributes.type = type;
        attributes.assessmentID = assessmentID;
        attributes.json = json;
        this.submit("/seed/submit/assessment/", attributes);
    }
}


Seed.postResponseForQuestionWithCallbacks = function (identifier, type,  assessmentID, json, showAnswers, successCallback, failureCallback)
{
    if (type != this.AssessmentType.QUIZ && type != this.AssessmentType.SURVEY && type != this.AssessmentType.POLL) {
        alert("Invalid assessment type : " + type);
    } else if (!assessmentID) {
        alert("Invalid assessment ID : " + assessmentID);
    } else {
        var attributes = {};
        attributes.type = type;
        attributes.assessmentID = assessmentID;
        attributes.json = json;
        attributes.showAnswers = showAnswers;
        attributes.successCallback = successCallback;
        attributes.failureCallback = failureCallback;
        attributes.identifier = identifier;
        this.submit("/seed/submit/assessment/answer", attributes);
    }
}


Seed.saveStateWithCallbacks = function (identifier, stateType, idOrNull, json, successCallback, failureCallback)
{
    var attributes = {};
    attributes.stateType = stateType;
    
    if (idOrNull) {
        attributes.stateID = idOrNull;
    }
    
    attributes.json = json;
    attributes.successCallback = successCallback;
    attributes.failureCallback = failureCallback;
    attributes.identifier = identifier;
    this.submit("/seed/save/assessment/state", attributes);
    
}


Seed.fetchStateWithCallbacks = function (identifier, stateType, idOrNull, successCallback, failureCallback)
{
    var attributes = {};
    attributes.stateType = stateType;
    
    if (idOrNull) {
        attributes.stateID = idOrNull;
    }
    
    attributes.successCallback = successCallback;
    attributes.failureCallback = failureCallback;
    attributes.identifier = identifier;
    this.submit("/seed/fetch/assessment/state", attributes);
}


Seed.startAssessmentWithCallbacks = function (identifier, type, assessmentID, json, successCallback, failureCallback)
{
    if (type != this.AssessmentType.QUIZ && type != this.AssessmentType.SURVEY && type != this.AssessmentType.POLL) {
        alert("Invalid assessment type : " + type);
    } else if (!assessmentID) {
        alert("Invalid assessment ID : " + assessmentID);
    } else {
        var attributes = {};
        attributes.type = type;
        attributes.assessmentID = assessmentID;
        attributes.successCallback = successCallback;
        attributes.failureCallback = failureCallback;
        attributes.json = json;
        attributes.identifier = identifier;
        this.submit("/seed/start/assessment/", attributes);
    }
}


Seed.displayQuestionWithCallbacks = function (identifier, assessmentID, questionID, attempt, successCallback, failureCallback)
{
    if (!assessmentID) {
        alert("Invalid assessment ID : " + assessmentID);
    } else {
        var attributes = {};
        attributes.assessmentID = assessmentID;
        attributes.questionID = questionID;
        attributes.attempt = attempt;
        attributes.identifier = identifier;
        attributes.successCallback = successCallback;
        attributes.failureCallback = failureCallback;
        this.submit("/seed/assessment/display/question", attributes);
    }
}


/***********************************************************************/
/* Custom Achievements & Badges Submit APIs                            */
/* successCallback must take 2 arguments: achievement ID/title, result */
/* failureCallback must take 2 aruguments: achievement ID/title, error */
/***********************************************************************/

Seed.submitCustomAchievementWithCallbacks = function (identifier, title, description, expPoints, successCallback, failureCallback)
{
    if (typeof identifier != "number") {
        failureCallback = successCallback;
        successCallback = expPoints;
        expPoints = description;
        description = title;
        title = identifier;
        identifier = 0;
    }
    var attributes = {};
    attributes.type = "achievement";
    attributes.title = title;
    attributes.description = description;
    attributes.expPoints = expPoints;
    attributes.successCallback = successCallback;
    attributes.failureCallback = failureCallback;
    attributes.identifier = identifier;
    this.submit("/seed/submit/achievement/", attributes);
}


Seed.submitCustomAchievement = function (title, description, expPoints)
{
    var attributes = {};
    attributes.type = "achievement";
    attributes.title = title;
    attributes.description = description;
    attributes.expPoints = expPoints;
    this.submit("/seed/submit/achievement/", attributes);
}


Seed.submitCustomBadgeWithCallbacks = function (identifier, title, description, successCallback, failureCallback)
{
    if (typeof identifier != "number") {
        failureCallback = successCallback;
        successCallback = description;
        description = title;
        title = identifier;
        identifier = 0;
    }
    var attributes = {};
    attributes.type = "badge";
    attributes.title = title;
    attributes.description = description;
    attributes.successCallback = successCallback;
    attributes.failureCallback = failureCallback;
    attributes.identifier = identifier;
    this.submit("/seed/submit/badge/", attributes);
}


Seed.submitCustomBadge = function (title, description)
{
    var attributes = {};
    attributes.type = "badge";
    attributes.title = title;
    attributes.description = description;
    this.submit("/seed/submit/badge/", attributes);
}


/***************************************************************************/
/* Completion Submit APIs                                                  */
/* successCallback must take 2 arguments: chapterID (could be nil), result */
/* failureCallback must take 2 aruguments: chapterID (could be nil), error */
/***************************************************************************/

Seed.submitCompletionWithCallbacks = function (identifier, completionProgress, successCallback, failureCallback)
{
    if (typeof identifier != "number") {
        failureCallback = successCallback;
        successCallback = completionProgress;
        completionProgress = identifier;
        identifier = 0;
    }
    var attributes = {};
    attributes.type = "completion";
    attributes.completionProgress = completionProgress;
    attributes.successCallback = successCallback;
    attributes.failureCallback = failureCallback;
    attributes.identifier = identifier;
    this.submit("/seed/submit/completion/", attributes);
}


Seed.submitCompletion = function (completionProgress)
{
    var attributes = {};
    attributes.type = "completion";
    attributes.completionProgress = completionProgress;
    this.submit("/seed/submit/completion/", attributes);
}


Seed.submitCompletionForChapterWithCallbacks = function (identifier, completionProgress, chapterID, successCallback, failureCallback)
{
    if (typeof identifier != "number") {
        failureCallback = successCallback;
        successCallback = chapterID;
        chapterID = completionProgress;
        completionProgress = identifier;
        identifier = 0;
    }

    var attributes = {};
    attributes.type = "completion";
    attributes.completionProgress = completionProgress;
    attributes.chapterID = chapterID;
    attributes.successCallback = successCallback;
    attributes.failureCallback = failureCallback;
    attributes.identifier = identifier;
    this.submit("/seed/submit/completion/", attributes);
}


Seed.submitCompletionForChapter = function (completionProgress, chapterID)
{
    var attributes = {};
    attributes.type = "completion";
    attributes.completionProgress = completionProgress;
    attributes.chapterID = chapterID;
    this.submit("/seed/submit/completion/", attributes);
}


/***************************************************************************/
/* Simulation Slide APIs                                                   */
/* successCallback must take 1 argument: details JSON object               */
/* failureCallback must take 1 String arugument: error                     */
/***************************************************************************/

Seed.initSlideWithCallback = function (successCallback, failureCallback)
{
    var value = {};
    value.functionname = "initSlide";
    value.successCallback = successCallback;
    value.failureCallback = failureCallback;
    this.submit("/seed/init/slide/", value);
}


Seed.closeSlide = function ()
{
    this.submit("/seed/close/slide/");
}

Seed.closeAsset = function ()
{
    var value = {};
    Seed.submit("/seed/closeAsset/", value);
}


Seed.closeInteractivity = function (showConfirmation, confirmationMessage)
{
    var value = {};
    
    if (typeof showConfirmation != "boolean") {
        value.showConfirmation = false;
    } else {
        value.showConfirmation = showConfirmation;
    }
    
    if (confirmationMessage) {
        value.confirmationMessage = confirmationMessage;
    }
    
    value.confirmationMessage = confirmationMessage;
    this.submit("/seed/closeInteractivity/", value);
}


Seed.setUserInteractionEnabled = function (isEnabled)
{
    var value = {};
    value.isUserInteractionEnabled = isEnabled;
    this.submit("/seed/enableuserinteraction/slide/", value);
}


/**************************************************************************/
/* Refresh Chapter APIs                                                   */
/**************************************************************************/

Seed.refreshChapters = function ()
{
    this.submit("/seed/refreshchapters/");
}


Seed.fetchAsset = function(id, options)
{
    this.submit("/seed/asset/part/" + id + "/", {
        'successCallbackFunctionName': options.successCallbackFunctionName
    });
}


Seed.fetchAssetWithCallbacks = function(identifier, partNumbers, successCallback, failureCallback)
{
    if (typeof identifier != "number") {
        failureCallback = successCallback;
        successCallback = partNumbers;
        partNumbers = identifier;
        identifier = 0;
    }

    this.submit("/seed/asset/part/" + partNumbers + "/", {
        'successCallbackFunctionName': successCallback,
         'failureCallback': failureCallback,
         'identifier': identifier
    });
}

/***************************************************************************/
/* Simulation Slide APIs                                                   */
/* successCallback must take 1 argument: string:url path                   */
/* failureCallback must take 1 String arugument: error                     */
/***************************************************************************/

Seed.getCommonURLWithCallback = Seed.getCommonURL = function(identifier, successCallback)
{
    var value = {};
    if (typeof identifier != "number") {
        successCallback = identifier;
        identifier = 0;
    }
    value.successCallback = successCallback;
    value.identifier = identifier;
    this.submit("/seed/getSharedFolderPath/", value);
}


Seed.presentLeaderboardWithCallbacks = function(identifier, partNumber, audienceID, successCallback, failureCallback)
{
    var attributes = {
        "partNumber": partNumber,
        "audienceID": audienceID,
        "identifier": identifier,
        "successCallback": successCallback,
        "failureCallback": failureCallback
    };
    this.submit("/seed/presentLeaderboard/", attributes);
}


Seed.retrieveLeaderboardDataWithCallbacks = function(identifier, partNumber, audienceID, successCallback, failureCallback)
{
    var attributes = {
        "identifier": identifier,
        "partNumber": partNumber,
        "audienceID": audienceID,
        "successCallback": successCallback,
        "failureCallback": failureCallback
    };
    this.submit("/seed/fetchLeaderboardDetailsWithRank/", attributes);
}


Seed.fetchLeaderboardsWithCallbacks = function(identifier, arrayOfPartNumbers, successCallback, failureCallback)
{
    var attributes = {
        "identifier": identifier,
        "partNumbers": arrayOfPartNumbers,
        "successCallback": successCallback,
        "failureCallback": failureCallback
    };
    this.submit("/seed/fetchLeaderboardDetails/", attributes);
}


Seed.fetchGameScoreLeaderboardsWithCallbacks = function(identifier, successCallback, failureCallback)
{
    var attributes = {
        "identifier": identifier,
        "successCallback": successCallback,
        "failureCallback": failureCallback
    };
    this.submit("/seed/fetchGameScoreLeaderboardDetails/", attributes);
}


Seed.presentLocalLeaderboard = function(title, description, displaySize, leaderboardArray)
{
    var attributes = {
        "title": title,
        "description": description,
        "displaySize": displaySize,
        "leaderboardArray": leaderboardArray
    };
    this.submit("/seed/presentLeaderboard/", attributes);
}


/***************************************************************************/
/* Game Score Submition API                                               */
/***************************************************************************/
Seed.submitGameScore = function(score)
{
    var value = {};
    value.functionname = "submitGameScore";
    value.score = score;
    this.submit("/seed/submitGameScore/", value);
}


/***************************************************************************/
/* Game Score Submition API                                               */
/***************************************************************************/
Seed.awardGameXP = function(percentage)
{
    var value = {};
    value.functionname = "awardGameXP";
    value.percentage = percentage;
    this.submit("/seed/submitAwardGameXP/", value);
}


/***************************************************************************/
/* checkTrainingModeWithCallback API                                                      */
/* completionCallBack must take 1 argument: BOOL:isTrainingMode               */
/***************************************************************************/
Seed.checkTrainingModeWithCallback = function(identifier, completionCallBack)
{
    if (typeof identifier != "number") {
        completionCallBack = identifier;
        identifier = 0;
    }
    var value = {};
    value.functionname = "isTrainingMode";
    value.completionCallBack = completionCallBack;
    value.identifier = identifier;
    this.submit("/seed/trainingMode/", value);
}


/***************************************************************************/
/* checkAssetHasAssessmentsWithCallback API                                */
/* completionCallBack must take 1 argument: BOOL:hasAssessments            */
/***************************************************************************/
Seed.checkAssessmentsWithCallbacks = function(identifier, successCallback, failureCallback)
{
    if (typeof identifier != "number") {
        failureCallback = successCallback;
        successCallback = identifier;
        identifier = 0;
    }
    
    var value = {};
    value.functionname = "hasAssessments";
    value.successCallback = successCallback;
    value.failureCallback = failureCallback;
    value.identifier = identifier;
    this.submit("/seed/hasAssessments/", value);
}


/***************************************************************************/
/* initLocalizedStringsFromKeysWithCallback API                                      */
/* keyList, is list of keys asking for values                                 */
/* completionCallBack must take 1 argument NSDictionary having key values  */
/***************************************************************************/
Seed.initLocalizedStringsFromKeysWithCallback = function (identifier, keyList, completionCallBack)
{
    if (typeof identifier != "number") {
        completionCallBack = keyList;
        keyList = identifier;
        identifier = 0;
    }
    var value = {};
    value.functionname = "initLocalizedStringsFromKeysWithCallback";
    value.keyList = keyList;
    value.completionCallBack = completionCallBack;
    value.identifier = identifier;
    this.submit("/seed/localizedstrings/", value);
}

/***************************************************************************/
/* initLocalizedStringsWithCallback API                                    */
/* completionCallBack must take 1 argument NSDictionary having key values  */
/***************************************************************************/
Seed.initAllLocalizedStringsWithCallback = function (identifier, completionCallBack)
{
    if (typeof identifier != "number") {
        completionCallBack = identifier;
        identifier = 0;
    }
    var value = {};
    value.functionname = "initAllLocalizedStringsWithCallback";
    value.completionCallBack = completionCallBack;
    value.identifier = identifier;
    this.submit("/seed/localizedstrings/", value);
}


/***************************************************************************/
/* checkViewAsModeWithCallback API                                                      */
/* completionCallBack must take 1 argument: BOOL:isViewAsMode               */
/***************************************************************************/
Seed.checkViewAsModeWithCallback = function(identifier, completionCallBack)
{
    if (typeof identifier != "number") {
        completionCallBack = identifier;
        identifier = 0;
    }
    var value = {};
    value.functionname = "isViewAsMode";
    value.completionCallBack = completionCallBack;
    value.identifier = identifier;
    this.submit("/seed/viewAsMode/", value);
}


/***************************************************************************/
/* checkNetworkWithCallback API                                            */
/* completionCallBack must take 1 argument: BOOL:isNetworkAvailable        */
/***************************************************************************/
Seed.checkNetworkWithCallback = function(identifier, completionCallBack)
{
    if (typeof identifier != "number") {
        completionCallBack = identifier;
        identifier = 0;
    }
    var value = {};
    value.functionname = "isNetworkAvailable";
    value.completionCallBack = completionCallBack;
    value.identifier = identifier;
    this.submit("/seed/network/", value);
}

/***************************************************************************/
/* brightCoveLocaleSelection API                                             */
/* completionCallBack must take 1 argument: String:brightcoveLocaleSelection   */
/***************************************************************************/

Seed.brightcoveLocaleSelected = function(identifier)
{
    var value = {};
    value.functionname = "brightcoveLocaleSelected";
    value.identifier = identifier;
    value.completionCallBack = 0;
    this.submit("/seed/brightcoveLocaleSelected/", value);
}

/***************************************************************************/
/* brightcoveUserDelay API                                    */
/* completionCallBack must take 3 argument: String: */
/***************************************************************************/

Seed.brightcoveUserDelay = function(identifier,videoID,delay)
{
    var value = {};
    value.functionname = "brightcoveUserDelay";
    value.identifier = identifier;
    value.completionCallBack = 0;
    value.videoID = videoID;
    value.delay = delay;
    this.submit("/seed/brightcoveUserDelay/", value);
}


/***************************************************************************/
/* checkStagingModeWithCallback API                                          */
/* completionCallBack must take 1 argument: BOOL:isStagingMode               */
/***************************************************************************/
Seed.checkStagingModeWithCallback = function(identifier, completionCallBack)
{
    if (typeof identifier != "number") {
        completionCallBack = identifier;
        identifier = 0;
    }
    var value = {};
    value.functionname = "isStagingMode";
    value.completionCallBack = completionCallBack;
    value.identifier = identifier;
    this.submit("/seed/staging/", value);
}

Seed.checkCompletionWithCallbacks = function(identifier, successCallback, failureCallback)
{
    if (typeof identifier != "number") {
        failureCallback = successCallback;
        successCallback = identifier;
        identifier = 0;
    }
    
    var value = {};
    value.successCallback = successCallback;
    value.failureCallback = failureCallback;
    value.identifier = identifier;
    this.submit("/seed/isAssetCompleted/", value);
}


Seed.getEnvironmentWithCallbacks = function(identifier, successCallback, failureCallback)
{
    var value = {};
    value.successCallback = successCallback;
    value.failureCallback = failureCallback;
    value.identifier = identifier;
    this.submit("/seed/getEnvironmentDetails/", value);
}

Seed.getPointerEvent = function(event) {
        if(typeof event.originalEvent != 'undefined' && typeof event.originalEvent.targetTouches)
            return event.originalEvent.targetTouches[0];

        return event;
};

Seed.touchStarted = false; // detect if a touch event is sarted
Seed.currX = 0;
Seed.currY = 0;
Seed.cachedX = 0;
Seed.cachedY = 0;

//setting the events listeners
document.addEventListener('touchstart', function(e){
//                  e.preventDefault();
                  var pointer = Seed.getPointerEvent(e);
                  // caching the current x
                  Seed.cachedX = Seed.currX = pointer.pageX;
                  // caching the current y
                  Seed.cachedY = Seed.currY = pointer.pageY;
                  // a touch event is detected
                  Seed.touchStarted = true;
                  //console.log('touch started');
                  // detecting if after 200ms the finger is still in the same position
                  setTimeout(function (){
                 if ((Seed.cachedX === Seed.currX) && !Seed.touchStarted && (Seed.cachedY === Seed.currY)) {
                    //console.log('tap');
                             
                    if ((!e.target.href) && e.target.nodeName!="INPUT" && !Seed.findAncestorsWithClassName(e.target, "doNotToggleChrome") && e.target.nodeName!="LABEL" && e.target.nodeName!="VIDEO" && e.target.className.indexOf("interactivityImage") < 0 && e.target.className.indexOf("playInteractivity") < 0 && e.target.className.indexOf("interactivityOverlay") < 0) {
                                 var value = {};
                                 Seed.submit("/seed/toggleChrome/", value);
                             }
                 }
             },200);
              });

Seed.onTouchCancel = function (e){
//        e.preventDefault();
        // here we can consider finished the touch event
        Seed.touchStarted = false;
        //console.log('touch ended');
};


Seed.findAncestorsWithClassName = function (element, className)
{
    var found = false;
    
    if (element.className.indexOf(className) < 0) {
        while (element.parentNode) {
            element = element.parentNode;
            if (element.nodeName=="DIV" && element.className.indexOf(className) >= 0) {
                found = true;
                break;
            }
        }
    } else {
        found = true;
    }
    
    return found;
};

Seed.log = function (message) {

    var logMessage;
    
    if (typeof message === 'string' || message instanceof String) {
        logMessage = message;
    } else {
        logMessage = JSON.stringify(message);
    }

    window.webkit.messageHandlers.log.postMessage({ 'message': logMessage });

};

/*
window.webkit.messageHandlers.ui.postMessage({'command': 'isNavigationBarHidden', 'value': 'true'});
window.webkit.messageHandlers.ui.postMessage({'command': 'prefersStatusBarHidden', 'value': 'true'});
window.webkit.messageHandlers.ui.postMessage({'command': 'shouldAutorotate','value': 'true'});
window.webkit.messageHandlers.ui.postMessage({'command': 'supportedInterfaceOrientations', 'value': 'all'});
window.webkit.messageHandlers.ui.postMessage({'command': 'deviceOrientation','value': 'landscapeLeft'});
*/

Seed.setNavigationBarHidden = function(isNavigationBarHidden) {
    
    window.webkit.messageHandlers.ui.postMessage({
        'command': 'isNavigationBarHidden',
        'value': isNavigationBarHidden.toString()
    });
};

Seed.setPrefersStatusBarHidden = function(prefersStatusBarHidden) {
    
    window.webkit.messageHandlers.ui.postMessage({
        'command': 'prefersStatusBarHidden',
        'value': prefersStatusBarHidden.toString()
    });
};

const SeedStatusBarStyle = {
defaultStyle: 0,
lightContent: 1,
darkContent: 2
};

Seed.setPreferredStatusBarStyle = function(preferredStatusBarStyle) {
    
    if (preferredStatusBarStyle == "lightContent") {
        preferredStatusBarStyle = SeedStatusBarStyle.lightContent;
    } else if (preferredStatusBarStyle == "darkContent") {
        preferredStatusBarStyle = SeedStatusBarStyle.darkContent;
    } else if (preferredStatusBarStyle == "default") {
        preferredStatusBarStyle = SeedStatusBarStyle.defaultStyle;
    }
    
    window.webkit.messageHandlers.ui.postMessage({
        'command': 'preferredStatusBarStyle',
        'value': preferredStatusBarStyle.toString()
    });
};

Seed.setShouldAutorotate = function(shouldAutorotate) {
    
    window.webkit.messageHandlers.ui.postMessage({
        'command': 'shouldAutorotate',
        'value': shouldAutorotate.toString()
    });
};

// See UIInterfaceOrientationMask in UIKit
// Accepted argument values:
// ["portrait", "landscapeLeft", "landscapeRight",
//  "portraitUpsideDown", "landscape", "all", "allButUpsideDown"]
// If you don't set this, default value is "all" for iPad,
// and "allButUpsideDown" for iPhone.  You must also call
// Seed.setShouldAutorotate(true) to use this.
Seed.setSupportedInterfaceOrientations = function(supportedInterfaceOrientations) {
    
    window.webkit.messageHandlers.ui.postMessage({
        'command': 'supportedInterfaceOrientations',
        'value': supportedInterfaceOrientations.toString()
    });
};

// Accepted argument values:
// ["portrait", "portraitUpsideDown", "landscapeLeft", "landscapeRight"]
// If you send an invalid value, it will default to portrait
Seed.setDeviceOrientation = function(deviceOrientation) {

    window.webkit.messageHandlers.ui.postMessage({
        'command': 'deviceOrientation',
        'value': deviceOrientation.toString()
    });
};

document.addEventListener('touchmove', function (e){
//                  e.preventDefault();
                  var pointer = Seed.getPointerEvent(e);
                  Seed.currX = pointer.pageX;
                  Seed.currY = pointer.pageY;
                  if(Seed.touchStarted) {
                     //console.log('swiping');
                  }
                 
              });

document.addEventListener("DOMContentLoaded", function() {
    appendStyles(`
        .video-js .vjs-progress-control.vjs-control {
            color: #0000FF;
            height: 1em;
            top: -3pt;
        }
                 
        .video-js .vjs-play-progress.vjs-slider-bar {
            color: #0000FF;
            height: 2pt;
        }
                 
        .video-js .vjs-slider-horizontal.vjs-slider.vjs-progress-holder {
            height: 2pt;
            color: #0000FF;
        }
                 
        .video-js {
            font-size: 8pt !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
        }

        .video-js ul {
            font-size: 8pt;
        }
    `);
});

document.addEventListener('touchend', Seed.onTouchCancel);
document.addEventListener('touchcancel', Seed.onTouchCancel);
