'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { User, Mail, Lock, Pencil, Check, X } from 'lucide-react'

interface Props {
  fullName: string | null
  email: string
}

function Field({
  label, value, editing, onChange, type = 'text', placeholder,
}: {
  label: string
  value: string
  editing: boolean
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 dark:border-slate-800 last:border-0">
      <span className="text-sm text-gray-500 dark:text-slate-400 shrink-0 w-28">{label}</span>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-2.5 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <span className="text-sm font-medium text-gray-900 dark:text-white text-right truncate">{value || <span className="text-gray-400 italic">Non renseigné</span>}</span>
      )}
    </div>
  )
}

export default function ProfileEditCard({ fullName, email }: Props) {
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)

  // Profile
  const [name, setName] = useState(fullName ?? '')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameError, setNameError] = useState('')
  const [nameSuccess, setNameSuccess] = useState(false)

  // Email
  const [newEmail, setNewEmail] = useState(email)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState(false)

  // Password
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState(false)

  async function saveName() {
    setNameError('')
    setNameLoading(true)
    const res = await fetch('/api/settings/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: name }),
    })
    setNameLoading(false)
    if (!res.ok) { setNameError((await res.json()).error); return }
    setNameSuccess(true)
    setEditingProfile(false)
    setTimeout(() => setNameSuccess(false), 3000)
  }

  async function saveEmail() {
    setEmailError('')
    if (!newEmail.includes('@')) { setEmailError('Email invalide'); return }
    setEmailLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    setEmailLoading(false)
    if (error) { setEmailError(error.message); return }
    setEmailSuccess(true)
    setEditingEmail(false)
  }

  async function savePassword() {
    setPwdError('')
    if (newPwd.length < 8) { setPwdError('Minimum 8 caractères'); return }
    if (newPwd !== confirmPwd) { setPwdError('Les mots de passe ne correspondent pas'); return }
    setPwdLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPwd })
      if (signInErr) { setPwdError('Mot de passe actuel incorrect'); setPwdLoading(false); return }
    }
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setPwdLoading(false)
    if (error) { setPwdError(error.message); return }
    setPwdSuccess(true)
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
    setEditingPassword(false)
    setTimeout(() => setPwdSuccess(false), 3000)
  }

  const inputClass = "w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <Card className="p-5 space-y-5">
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Mon profil</h3>
      </div>

      {/* Nom */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Nom complet</span>
          {!editingProfile ? (
            <button onClick={() => setEditingProfile(true)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500">
              <Pencil className="w-3 h-3" /> Modifier
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={saveName} disabled={nameLoading} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-500">
                <Check className="w-3.5 h-3.5" /> {nameLoading ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button onClick={() => { setEditingProfile(false); setName(fullName ?? '') }} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" /> Annuler
              </button>
            </div>
          )}
        </div>
        {editingProfile ? (
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom complet" className={inputClass} />
        ) : (
          <p className="text-sm text-gray-900 dark:text-white">{fullName || <span className="text-gray-400 italic">Non renseigné</span>}</p>
        )}
        {nameError && <p className="text-xs text-red-500">{nameError}</p>}
        {nameSuccess && <p className="text-xs text-green-600">Nom mis à jour.</p>}
      </div>

      <div className="border-t border-gray-100 dark:border-slate-800" />

      {/* Email */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Adresse email</span>
          </div>
          {!editingEmail ? (
            <button onClick={() => setEditingEmail(true)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500">
              <Pencil className="w-3 h-3" /> Modifier
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={saveEmail} disabled={emailLoading} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-500">
                <Check className="w-3.5 h-3.5" /> {emailLoading ? 'Envoi…' : 'Enregistrer'}
              </button>
              <button onClick={() => { setEditingEmail(false); setNewEmail(email) }} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" /> Annuler
              </button>
            </div>
          )}
        </div>
        {editingEmail ? (
          <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className={inputClass} />
        ) : (
          <p className="text-sm text-gray-900 dark:text-white">{email}</p>
        )}
        {emailError && <p className="text-xs text-red-500">{emailError}</p>}
        {emailSuccess && <p className="text-xs text-green-600">Un email de confirmation a été envoyé à {newEmail}. Vérifiez votre boîte mail.</p>}
      </div>

      <div className="border-t border-gray-100 dark:border-slate-800" />

      {/* Mot de passe */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Mot de passe</span>
          </div>
          {!editingPassword ? (
            <button onClick={() => setEditingPassword(true)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500">
              <Pencil className="w-3 h-3" /> Modifier
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={savePassword} disabled={pwdLoading} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-500">
                <Check className="w-3.5 h-3.5" /> {pwdLoading ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button onClick={() => { setEditingPassword(false); setCurrentPwd(''); setNewPwd(''); setConfirmPwd('') }} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" /> Annuler
              </button>
            </div>
          )}
        </div>
        {!editingPassword ? (
          <p className="text-sm text-gray-400">••••••••</p>
        ) : (
          <div className="space-y-2">
            <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="Mot de passe actuel" className={inputClass} />
            <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Nouveau mot de passe (8 min)" className={inputClass} />
            <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Confirmer le nouveau mot de passe" className={inputClass} />
          </div>
        )}
        {pwdError && <p className="text-xs text-red-500">{pwdError}</p>}
        {pwdSuccess && <p className="text-xs text-green-600">Mot de passe mis à jour.</p>}
      </div>
    </Card>
  )
}
