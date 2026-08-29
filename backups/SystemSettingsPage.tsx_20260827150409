import { Settings, Bell, Shield, Database, Mail, Globe } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function SystemSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light text-gray-900 mb-2">System Settings</h1>
        <p className="text-gray-600 font-light">
          Configure platform settings and preferences
        </p>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#8b0000] rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#ffd100]" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">General Settings</h2>
            <p className="text-sm text-gray-600">Basic platform configuration</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="platform-name">Platform Name</Label>
            <Input 
              id="platform-name" 
              defaultValue="SCOUP - Salisbury University-Industry Connection and Unified Platform"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input 
              id="tagline" 
              defaultValue="Connecting Industry with Academic Excellence"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="contact-email">Contact Email</Label>
            <Input 
              id="contact-email" 
              type="email"
              defaultValue="scoup@salisbury.edu"
              className="mt-2"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Maintenance Mode</div>
              <div className="text-sm text-gray-600">Temporarily disable public access</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8b0000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b0000]"></div>
            </label>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button className="bg-[#8b0000] hover:bg-[#6b0000] text-white">
            Save General Settings
          </Button>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#8b0000] rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-[#ffd100]" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">Email Configuration</h2>
            <p className="text-sm text-gray-600">Manage email notifications and templates</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Welcome Emails</div>
              <div className="text-sm text-gray-600">Send welcome email to new faculty</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8b0000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b0000]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Weekly Digest</div>
              <div className="text-sm text-gray-600">Send weekly activity summary to admins</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8b0000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b0000]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Contact Request Notifications</div>
              <div className="text-sm text-gray-600">Notify faculty of new contact requests</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8b0000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b0000]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#8b0000] rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#ffd100]" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">Privacy & Security</h2>
            <p className="text-sm text-gray-600">Configure security and privacy settings</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Two-Factor Authentication</div>
              <div className="text-sm text-gray-600">Require 2FA for all admin accounts</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8b0000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b0000]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Profile Approval</div>
              <div className="text-sm text-gray-600">Require admin approval for new profiles</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8b0000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b0000]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Data Encryption</div>
              <div className="text-sm text-gray-600">Encrypt sensitive faculty information</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8b0000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b0000]"></div>
            </label>
          </div>

          <div>
            <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
            <Input 
              id="session-timeout" 
              type="number"
              defaultValue="30"
              className="mt-2"
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#8b0000] rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-[#ffd100]" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">Data Management</h2>
            <p className="text-sm text-gray-600">Backup and data retention settings</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Automatic Backups</div>
              <div className="text-sm text-gray-600">Daily automated database backups</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8b0000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b0000]"></div>
            </label>
          </div>

          <div>
            <Label htmlFor="retention-period">Data Retention Period (days)</Label>
            <Input 
              id="retention-period" 
              type="number"
              defaultValue="365"
              className="mt-2"
            />
            <p className="text-xs text-gray-600 mt-1">How long to keep deleted items before permanent removal</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" className="border-gray-300">
              <Database className="w-4 h-4 mr-2" />
              Backup Now
            </Button>
            <Button variant="outline" className="border-gray-300">
              <Database className="w-4 h-4 mr-2" />
              Restore from Backup
            </Button>
          </div>
        </div>
      </div>

      {/* Public Access */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#8b0000] rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-[#ffd100]" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">Public Access Settings</h2>
            <p className="text-sm text-gray-600">Control what external users can see</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Public Search</div>
              <div className="text-sm text-gray-600">Allow external users to search faculty</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8b0000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b0000]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Contact Forms</div>
              <div className="text-sm text-gray-600">Allow external contact requests</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8b0000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b0000]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Download Publications</div>
              <div className="text-sm text-gray-600">Allow public download of papers (if permitted by faculty)</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8b0000]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b0000]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}