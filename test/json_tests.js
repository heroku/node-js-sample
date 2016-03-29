var assert = require('assert');
var fs = require('fs');
var pathToQuizzes = './json/quizzes';

describe('every quiz file', function () {
    it('should have a corresponding answer keys file, and a category in their name', function () {
        var errors = [];
        var quizList = [];
        var answerKeyList = [];
        var actualQuizName;
        var actualAnswerKeyName;
        var fileNames = fs.readdirSync(pathToQuizzes);
        var categoryList = [];
        fileNames.forEach(function(fileName) {
            try {
                var quizNameGroups = /(.*)_(.*)Quiz.json/.exec(fileName);
                var answerKeyNameGroups = /(.*)_(.*)QuizAnswerKeys.json/.exec(fileName);
                categoryList.push(/(.*)_/.exec(fileName)[1]);
                actualQuizName = quizNameGroups ? quizNameGroups[2] : false;
                actualAnswerKeyName = answerKeyNameGroups ? answerKeyNameGroups[2] : false;
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