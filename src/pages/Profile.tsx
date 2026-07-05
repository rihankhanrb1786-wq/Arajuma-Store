/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User as UserIcon, 
  MapPin, 
  Bell, 
  Settings, 
  Trash2, 
  Plus, 
  Save, 
  CheckCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { Address, User, Notification } from '../types';

interface ProfileProps {
  currentUser: User | null;
  addresses: Address[];
  notifications: Notification[];
  onAddAddress: (addr: Omit<Address, 'id'>) => void;
  onDeleteAddress: (id: string) => void;
  onUpdateProfile: (name: string, phone: string) => void;
  onMarkNotificationRead: (id: string) => void;
  onNavigate: (page: string, params?: any) => void;
  initialTab?: 'settings' | 'addresses' | 'notifications';
}

export default function Profile({
  currentUser,
  addresses,
  notifications,
  onAddAddress,
  onDeleteAddress,
  onUpdateProfile,
  onMarkNotificationRead,
  onNavigate,
  initialTab = 'settings'
}: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'addresses' | 'notifications'>(initialTab);
  
  // Profile settings state
  const [profileName, setProfileName] = useState(currentUser?.name || 'Rihan Khan');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '9876543210');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // New Address form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newHouse, setNewHouse] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newType, setNewType] = useState<'Home' | 'Work' | 'Other'>('Home');

  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileName, profilePhone);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !newHouse || !newArea || !newPincode) return;

    onAddAddress({
      name: newName,
      phone: newPhone,
      houseNumber: newHouse,
      area: newArea,
      landmark: newLandmark,
      city: 'Guwahati',
      state: 'Assam',
      pincode: newPincode,
      type: newType
    });

    // Reset
    setNewName('');
    setNewPhone('');
    setNewHouse('');
    setNewArea('');
    setNewLandmark('');
    setNewPincode('');
    setShowAddressForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" id="profile-dashboard-root">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6 mb-8 gap-4">
        <div>
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-1 text-xs font-bold text-gray-400 hover:text-brand-green mb-2 cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" />
            <span>Go to Storefront</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Customer Dashboard
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Manage your saved locations, alerts, and settings in one secure hub
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Tab sidebar */}
        <aside className="md:col-span-3 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-1" id="profile-tabs-sidebar">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2.5 cursor-pointer ${
              activeTab === 'settings' 
                ? 'bg-emerald-50 text-brand-green' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span>Profile Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2.5 cursor-pointer ${
              activeTab === 'addresses' 
                ? 'bg-emerald-50 text-brand-green' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>Saved Addresses</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'notifications' 
                ? 'bg-emerald-50 text-brand-green' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center space-x-2.5">
              <Bell className="w-4 h-4 flex-shrink-0" />
              <span>Notifications Center</span>
            </span>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="bg-brand-orange text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>
        </aside>

        {/* Right: Tab view contents */}
        <div className="md:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[350px]">
          {/* Tab 1: Profile Settings Form */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-3 flex items-center">
                <UserIcon className="w-4.5 h-4.5 mr-2 text-brand-green" />
                Profile Information
              </h2>

              <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-gray-50 text-xs px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-green focus:bg-white transition-all font-semibold text-gray-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Mobile / Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-gray-50 text-xs px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-green focus:bg-white transition-all font-semibold text-gray-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Email Address (Primary Google Auth)</label>
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || 'rihankhanrb1786@gmail.com'}
                    className="w-full bg-gray-100 text-xs px-4 py-2.5 rounded-xl border border-gray-200 cursor-not-allowed font-semibold text-gray-400"
                  />
                  <span className="text-[9px] text-gray-400 font-semibold block leading-none mt-1">Google primary accounts cannot be modified manually.</span>
                </div>

                {profileSaveSuccess && (
                  <p className="text-emerald-600 text-xs font-bold flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-emerald-500" />
                    Profile settings saved successfully!
                  </p>
                )}

                <button
                  type="submit"
                  className="bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer transition-all border border-emerald-500"
                >
                  Save Profile Settings
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Saved Addresses book */}
          {activeTab === 'addresses' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center">
                  <MapPin className="w-4.5 h-4.5 mr-2 text-brand-green" />
                  Address Book Location Logs
                </h2>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-xs font-bold text-brand-green hover:text-brand-green-hover flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* Add form inside profile */}
              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4 max-w-lg">
                  <input
                    type="text"
                    placeholder="Recipient Full Name*"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-green"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="tel"
                      placeholder="10-Digit Phone*"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="bg-white text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-green"
                    />
                    <input
                      type="text"
                      placeholder="Flat / House / Suite*"
                      required
                      value={newHouse}
                      onChange={(e) => setNewHouse(e.target.value)}
                      className="bg-white text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-green"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Colony / Area / Street*"
                      required
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      className="bg-white text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-green"
                    />
                    <input
                      type="text"
                      placeholder="Pincode*"
                      required
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      className="bg-white text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-green"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase mr-1">Tag:</span>
                    {['Home', 'Work', 'Other'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewType(type as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          newType === type
                            ? 'bg-brand-green text-white shadow-sm'
                            : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 border border-gray-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Saved list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-2xl border border-gray-200 text-left relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="bg-gray-100 text-gray-600 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                          {addr.type}
                        </span>
                        
                        {/* Delete Address */}
                        {addresses.length > 1 && (
                          <button
                            onClick={() => onDeleteAddress(addr.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                            title="Delete address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <h4 className="font-extrabold text-sm text-gray-800">{addr.name}</h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        {addr.houseNumber}, {addr.area}, {addr.landmark ? `${addr.landmark}, ` : ''}{addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span>
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold block mt-3">Phone: +91 {addr.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Notifications center */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-3 flex items-center">
                <Bell className="w-4.5 h-4.5 mr-2 text-brand-green" />
                Notification Alerts Hub
              </h2>

              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && onMarkNotificationRead(n.id)}
                      className={`py-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-gray-50/50 px-2 rounded-xl transition-all ${
                        !n.isRead ? 'bg-emerald-50/10 font-bold' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3 text-xs">
                        <div className={`p-2 rounded-full mt-0.5 ${
                          !n.isRead ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h3 className={`font-bold ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</h3>
                          <p className="text-xs text-gray-500 font-semibold mt-1 leading-normal">{n.message}</p>
                          <span className="text-[10px] text-gray-400 font-bold flex items-center mt-2">
                            <Clock className="w-3 h-3 mr-1" />
                            {n.date}
                          </span>
                        </div>
                      </div>

                      {!n.isRead && (
                        <span className="bg-brand-green text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          New
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 font-semibold">
                  No active notification logs found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
