'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase, SupportTicketFormData } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import { Mail, Paperclip, Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function SupportPage() {
  const { user } = useUser()
  const [formData, setFormData] = useState<SupportTicketFormData>({
    user_email: user?.emailAddresses[0]?.emailAddress || '',
    issue_summary: '',
    detailed_description: '',
    attachment: undefined
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [referenceId, setReferenceId] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      // Generate reference ID
      const { data: refData, error: refError } = await supabase
        .rpc('generate_reference_id')

      if (refError) throw refError

      const generatedRefId = refData

      // Upload attachment if provided
      let attachmentUrl = null
      let attachmentFilename = null

      if (formData.attachment) {
        const fileExt = formData.attachment.name.split('.').pop()
        const fileName = `${user.id}/${generatedRefId}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('support-attachments')
          .upload(fileName, formData.attachment)

        if (uploadError) throw uploadError

        attachmentUrl = uploadData.path
        attachmentFilename = formData.attachment.name
      }

      // Insert support ticket
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          reference_id: generatedRefId,
          user_id: user.id,
          user_email: formData.user_email,
          issue_summary: formData.issue_summary,
          detailed_description: formData.detailed_description,
          attachment_url: attachmentUrl,
          attachment_filename: attachmentFilename,
          status: 'open',
          priority: 'medium'
        })
        .select()

      if (error) throw error

      setReferenceId(generatedRefId)
      setSubmitStatus('success')
      
      // Reset form
      setFormData({
        user_email: user.emailAddresses[0]?.emailAddress || '',
        issue_summary: '',
        detailed_description: '',
        attachment: undefined
      })

    } catch (error) {
      console.error('Error submitting support ticket:', error)
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setFormData({ ...formData, attachment: file })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Need help? We're here to assist you. Submit a support ticket and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="card mb-8 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
                  Support Ticket Submitted Successfully!
                </h3>
                <p className="text-green-700 dark:text-green-300 mt-1">
                  Your reference ID is: <span className="font-mono font-bold">{referenceId}</span>
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  We've received your request and will respond within 24 hours. Please keep your reference ID for future correspondence.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitStatus === 'error' && (
          <div className="card mb-8 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                  Error Submitting Support Ticket
                </h3>
                <p className="text-red-700 dark:text-red-300 mt-1">
                  {errorMessage}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  Please try again or contact us directly if the problem persists.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Support Form */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Mail className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Submit Support Ticket
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="user_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="user_email"
                required
                value={formData.user_email}
                onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                className="input-field"
                placeholder="your.email@example.com"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                We'll use this email to respond to your support request
              </p>
            </div>

            {/* Issue Summary */}
            <div>
              <label htmlFor="issue_summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Issue Summary *
              </label>
              <input
                type="text"
                id="issue_summary"
                required
                maxLength={200}
                value={formData.issue_summary}
                onChange={(e) => setFormData({ ...formData, issue_summary: e.target.value })}
                className="input-field"
                placeholder="Brief description of your issue"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.issue_summary.length}/200 characters
              </p>
            </div>

            {/* Detailed Description */}
            <div>
              <label htmlFor="detailed_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Detailed Description *
              </label>
              <textarea
                id="detailed_description"
                required
                rows={6}
                value={formData.detailed_description}
                onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
                className="input-field"
                placeholder="Please provide as much detail as possible about your issue, including steps to reproduce if applicable..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                The more details you provide, the better we can help you
              </p>
            </div>

            {/* File Attachment */}
            <div>
              <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attachment (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  id="attachment"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.csv,.xlsx,.xls"
                />
                <label
                  htmlFor="attachment"
                  className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Paperclip className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formData.attachment ? formData.attachment.name : 'Choose file'}
                  </span>
                </label>
                {formData.attachment && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, attachment: undefined })}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG, GIF, CSV, XLSX, XLS (Max 10MB)
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Support Ticket
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Response Time
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              We typically respond to support tickets within 24 hours during business days. 
              For urgent issues, please mark them as high priority.
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              What to Include
            </h3>
            <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-1">
              <li>• Steps to reproduce the issue</li>
              <li>• Expected vs actual behavior</li>
              <li>• Browser/device information</li>
              <li>• Screenshots or error messages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
