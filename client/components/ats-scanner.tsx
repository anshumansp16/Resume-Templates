"use client";

import { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle2, Info, TrendingUp, TrendingDown, Target } from 'lucide-react';
import axios from 'axios';

interface ATSScannerProps {
  resumeData: any;
  jobDescription?: string;
}

interface ATSIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  suggestion: string;
}

interface ATSResult {
  score: number;
  grade: string;
  issues: ATSIssue[];
  strengths: string[];
  improvements: string[];
  keywordMatches?: {
    matched: string[];
    missing: string[];
    matchRate: number;
  };
}

export function ATSScanner({ resumeData, jobDescription }: ATSScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [jobDesc, setJobDesc] = useState(jobDescription || '');
  const [showJobDescInput, setShowJobDescInput] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    try {
      const response = await axios.post('/api/ats-scan', {
        resumeData,
        jobDescription: jobDesc || undefined
      });

      if (response.data.success) {
        setResult(response.data);
      }
    } catch (error) {
      console.error('ATS scan failed:', error);
    } finally {
      setScanning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 50) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (grade === 'B') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    if (grade === 'C') return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            ATS Compatibility Scanner
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Check how well your resume will perform with Applicant Tracking Systems
          </p>
        </div>
      </div>

      {/* Job Description Input (Optional) */}
      <div className="space-y-3">
        <button
          onClick={() => setShowJobDescInput(!showJobDescInput)}
          className="text-sm text-primary-light hover:text-primary underline"
        >
          {showJobDescInput ? 'Hide' : 'Add'} job description for keyword matching
        </button>

        {showJobDescInput && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Job Description (Optional - for keyword analysis)
            </label>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="Paste the job description here to analyze keyword matches..."
            />
          </div>
        )}
      </div>

      {/* Scan Button */}
      <button
        onClick={handleScan}
        disabled={scanning}
        className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
      >
        {scanning ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Scanning Resume...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Target className="h-5 w-5" />
            Run ATS Scan
          </span>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Score Card */}
          <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-6 shadow-lg dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">ATS Compatibility Score</p>
                <div className="flex items-baseline gap-3">
                  <span className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}
                  </span>
                  <span className="text-2xl text-zinc-400 dark:text-zinc-500">/100</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg text-2xl font-bold ${getGradeColor(result.grade)}`}>
                {result.grade}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${
                  result.score >= 85
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : result.score >= 70
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    : result.score >= 50
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                    : 'bg-gradient-to-r from-red-500 to-rose-500'
                }`}
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>

          {/* Keyword Matches */}
          {result.keywordMatches && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Keyword Match Analysis
              </h4>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Match Rate</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {result.keywordMatches.matchRate}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000"
                    style={{ width: `${result.keywordMatches.matchRate}%` }}
                  />
                </div>
              </div>

              {result.keywordMatches.missing.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Missing Keywords:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.keywordMatches.missing.slice(0, 10).map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Strengths */}
          {result.strengths.length > 0 && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900/50 dark:bg-green-900/20">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Strengths ({result.strengths.length})
              </h4>
              <ul className="space-y-2">
                {result.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-green-800 dark:text-green-200 flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Issues */}
          {result.issues.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Issues Found ({result.issues.length})
              </h4>
              <div className="space-y-3">
                {result.issues.map((issue, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 border ${
                      issue.type === 'error'
                        ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20'
                        : issue.type === 'warning'
                        ? 'border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-900/20'
                        : 'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {issue.type === 'error' ? (
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                      ) : issue.type === 'warning' ? (
                        <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                      ) : (
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                            {issue.category}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white mb-1">
                          {issue.message}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          💡 {issue.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Improvements */}
          {result.improvements.length > 0 && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/50 dark:bg-blue-900/20">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Top Improvements Needed
              </h4>
              <ul className="space-y-2">
                {result.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                    <span className="font-bold">{index + 1}.</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
