var assert = require('assert');
var fs = require('fs');
var quizzesPath = './json/quizzes';

describe('every quiz file', function () {
    it('should have a corresponding answer keys file', function () {
        "use strict";
        let fileNames = [];
        let errors = [];
        let quizList = [];
        let answerKeyList = [];
        let actualQuizName;
        let actualAnswerKeyName;
        fileNames = fs.readdirSync(quizzesPath);
        fileNames.forEach(function(fileName) {
            try {
                let quizNameGroups = /(.*)Quiz.json/.exec(fileName);
                let answerKeyNameGroups = /(.*)QuizAnswerKeys.json/.exec(fileName);
                actualQuizName = quizNameGroups ? quizNameGroups[1] : false;
                actualAnswerKeyName = answerKeyNameGroups ? answerKeyNameGroups[1] : false;
                if (actualQuizName) { quizList.push(actualQuizName); }
                if (actualAnswerKeyName) { answerKeyList.push(actualAnswerKeyName); }
                if (!actualQuizName && !actualAnswerKeyName) { errors.push("File: '" + fileName + "' does not have 'Quiz.json' or 'QuizAnswer.json' in it's name. It should have."); }
            } catch(e) {
                errors.push(e);
            }
        });

        assert(errors.length === 0, "errors should be zero, but the following error(s) occured: " + JSON.stringify(errors));
        assert(quizList.length !== 0, "Should have at least one quiz json file");
        assert(answerKeyList.length !== 0, "Should have at least one answer key json file");
        assert(quizList.length === answerKeyList.length, "Should have same quiz json files as answer key files. QuizList:" + quizList + " || answerKeyList: " + answerKeyList);
        quizList.forEach( function(quizName) {
            assert(answerKeyList.includes(quizName), "every quiz should have a corresponding answer key json file");
        });
    });
});



if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
        'use strict';
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(arguments[1]) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) {k = 0;}
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
                return true;
            }
            k++;
        }
        return false;
    };
}