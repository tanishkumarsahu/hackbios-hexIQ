"use client";

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { X, Sparkles } from 'lucide-react';
import warmIntroService from '../../lib/warmIntroService';
import { toast } from 'sonner';

export default function WarmIntroRequestModal({
  isOpen,
  onClose,
  requester,
  targetUser
}) {
  const [goal, setGoal] = useState('career_guidance');
  const [message, setMessage] = useState('');
  const [preferredTime, setPreferredTime] = useState('no_preference');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !requester || !targetUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please add a short message');
      return;
    }

    try {
      setSubmitting(true);
      await warmIntroService.createRequest({
        requesterId: requester.id,
        alumniId: targetUser.id,
        goal,
        message: message.trim(),
        preferredTime
      });
      toast.success('Warm intro request sent');
      onClose();
      setMessage('');
      setGoal('career_guidance');
      setPreferredTime('no_preference');
    } catch (error) {
      console.error('Failed to send warm intro request:', error);
      toast.error('Failed to send warm intro request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-xl border border-orange-100">
          <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">
                  Request Warm Intro
                </CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Reach out to {targetUser?.name || 'this alumnus'} with context.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Your goal
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="career_guidance">Career guidance</option>
                  <option value="internship">Internship / job opportunity</option>
                  <option value="referral">Referral</option>
                  <option value="portfolio_review">Portfolio / CV review</option>
                  <option value="higher_studies">Higher studies advice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Short message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                  rows={4}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Introduce yourself briefly and explain how they can help (max 500 characters)."
                />
                <div className="mt-1 text-[10px] text-gray-400 text-right">
                  {message.length}/500
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Preferred time
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="no_preference">No strong preference</option>
                  <option value="this_week">Sometime this week</option>
                  <option value="next_week">Next week</option>
                  <option value="weekend">Weekend only</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-8 text-xs bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
