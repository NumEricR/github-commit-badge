// github-commit-badge.js (c) 2008 by Johannes 'heipei' Gilger
//
// The source-code should be pretty self-explanatory. Also look at the 
// style.css to customize the badge.

// for truncating the commit-id and commit-message in place
function truncate(string, length, truncation) {
    length = length || 30;
    truncation = (typeof truncation == 'undefined') ? '...' : truncation;
    return string.length > length ? string.slice(0, length - truncation.length) + truncation : string;
};

function parseDate(dateTime) {	// thanks to lachlanhardy
	var timeZone = 1;	// TODO: This doesn't really work

	dateTime = dateTime.substring(0, 19) + "Z";
	var theirTime = dateTime.substring(11, 13);
	var ourTime = parseInt(theirTime) + 7 + timeZone;
	if (ourTime > 24) {
		ourTime = ourTime - 24;
	};
	dateTime = dateTime.replace("T" + theirTime, "T" + ourTime);
	return dateTime;
};

var DEFAULT_BRANCH_NAME = 'master';
var COMMIT_MSG_MAX_LENGTH = 100;
var COMMIT_DISPLAYED_ID_LENGTH = 7;
var SHOW_FILES_TXT = 'Show files';
var HIDE_FILES_TXT = 'Hide files';
var GRAVATAR_URL_PREFIX = 'http://www.gravatar.com/avatar/';
var GRAVATAR_IMG_SIZE = 60;

function mainpage () {
    $.each(Badges, function(i, badgeData) {
        var branchName = ((typeof badgeData.branch == 'undefined' || badgeData.branch.length == 0) ? DEFAULT_BRANCH_NAME : badgeData.branch);
        var urlData = "http://github.com/api/v1/json/" + badgeData.username + "/" + badgeData.repo 
	        + "/commit/" + branchName + "?callback=?";
    
        $.getJSON(urlData, function(data) {
		    var myUser = badgeData.username;
		    var myRepo = badgeData.repo.replace(/\./g, '-');
		    var myEval = eval(data);
		    var added = myEval.commit.added || [];
		    var modified = myEval.commit.modified || [];
		    var removed = myEval.commit.removed || [];
            var githubUrl = 'http://github.com';
		    
		    // outline-class is used for the badge with the border
		    var myBadge = document.createElement("div");
		    myBadge.setAttribute("class", "outline");
		    myBadge.setAttribute("id", myUser + '_' + myRepo);
            
		    // the username/repo
		    var myUserRepo = document.createElement("div");
		    myUserRepo.setAttribute("class", "username");

			var myLink = document.createElement("a");
			myLink.setAttribute("href", githubUrl + "/" + myUser + "/" + myRepo);
			myLink.appendChild(document.createTextNode(myUser + "/" + myRepo));
			myUserRepo.appendChild(myLink);

			// myDiffLine is the "foo committed xy on date" line 
			var myDiffLine = document.createElement("div");
		    myDiffLine.setAttribute("class", "diffline");
	        
			myLink = document.createElement("a");
			myLink.setAttribute("href", githubUrl + myEval.commit.url);
		    myLink.setAttribute("class", "badge");
		    myLink.appendChild(document.createTextNode(" " + truncate(myEval.commit.id,COMMIT_DISPLAYED_ID_LENGTH,"")));
			myDiffLine.appendChild(document.createTextNode(myEval.commit.committer.name + ' '));
			var spanAction = document.createElement("span");
			spanAction.appendChild(document.createTextNode('committed'));
			spanAction.setAttribute("class", "action");
		    myDiffLine.appendChild(spanAction);
		    
			var myDate = document.createElement("span");
			var dateTime = parseDate(myEval.commit.committed_date);
			myDate.setAttribute("class", 'text-date');
			myDate.setAttribute("title", dateTime);
			myDate.appendChild(document.createTextNode(dateTime));
		    
			myDiffLine.appendChild(myLink);
			myDiffLine.appendChild(document.createTextNode(" about "));
			myDiffLine.appendChild(myDate);
		
			// myCommitMessage is the commit-message
			var myCommitMessage = document.createElement("div");
		    myCommitMessage.setAttribute("class", "commitmessage");
		    myCommitMessage.appendChild(document.createTextNode('"' + truncate(myEval.commit.message,COMMIT_MSG_MAX_LENGTH) + '"'));
		    
		    // myDiffStat shows how many files were added/removed/changed
		    var myDiffStat = document.createElement("div");
		    myDiffStat.setAttribute("class", "diffstat");
		    myDiffStat.innerHTML = "(" + added.length + " <span class='diffadded'>added</span>, " 
			    + removed.length + " <span class='diffremoved'>removed</span>, " 
			    + modified.length + " <span class='diffchanged'>changed</span>) ";
		    
		    // throw everything into our badge
		    myBadge.appendChild(myUserRepo);
		    myBadge.appendChild(myDiffLine);
		    myBadge.appendChild(myCommitMessage);
		    myBadge.appendChild(myDiffStat);
            
		    // and then the whole badge into the container
		    $("#gcb-container")[0].appendChild(myBadge);
            
		    $(".text-date").humane_dates();	// works here (still, ugly!)
        });
    });
};

// libs we need (mind the order!) (probably obsolete now)
var myLibs = ["everything"];

// Getting the path/url by looking at our main .js already included in the web-page
var myScriptsDefs = document.getElementsByTagName("script");
for (var i=0; i < myScriptsDefs.length; i++) {
	if (myScriptsDefs[i].src && myScriptsDefs[i].src.match(/github-commit-badge\.js/)) {
		this.path = myScriptsDefs[i].src.replace(/github-commit-badge\.js/, '');
	};
};

// Loading the libs
for (var i=0; i < myLibs.length; ++i) {
	var myScript = document.createElement("script");
	myScript.setAttribute("type","text/javascript");
	if (document.URL.match(/^http/)) {	// only serve the gzipped lib if we're serving from http
		myScript.setAttribute("src", this.path + "lib/" + myLibs[i] + ".jsgz");
	} else {
		myScript.setAttribute("src", this.path + "lib/" + myLibs[i] + ".js");
	};
	if (i == myLibs.length-1) {	// only load our main function after the lib has finished loading
		 //myScript.setAttribute("onload","mainpage();");
		 document.getElementsByTagName("body")[0].setAttribute("onload","mainpage();");
	};
	document.getElementById("gcb-container").appendChild(myScript);
};

// Write the stylesheet into the <head>
myHead = document.getElementsByTagName("head")[0];
myCSS = document.createElement("link");
myCSS.setAttribute("rel", "stylesheet");
myCSS.setAttribute("type", "text/css");
myCSS.setAttribute("href", this.path + "style.css");
myHead.appendChild(myCSS);
