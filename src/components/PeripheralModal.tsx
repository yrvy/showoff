import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase, Peripheral } from '@/lib/supabase'
import { uploadFile } from '@/lib/storage'
import { X, Upload, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

interface PeripheralModalProps {
  peripheral: Peripheral | null
  onClose: () => void
  onSuccess: () => void
}

export default function PeripheralModal({ peripheral, onClose, onSuccess }: PeripheralModalProps) {
  const { profile } = useAuth()
  const [category, setCategory] = useState(peripheral?.category || 'mouse')
  const [brand, setBrand] = useState(peripheral?.brand || '')
  const [model, setModel] = useState(peripheral?.model || '')
  const [purchaseUrl, setPurchaseUrl] = useState(peripheral?.purchase_url || '')
  const [notes, setNotes] = useState(peripheral?.notes || '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5242880) {
        toast.error('Image file is too large. Maximum size is 5MB.')
        return
      }
      setImageFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile) return

    setLoading(true)

    try {
      let imageUrl = peripheral?.image_url || null

      if (imageFile) {
        imageUrl = await uploadFile('peripherals', imageFile, profile.id)
      }

      const peripheralData = {
        user_id: profile.id,
        category,
        brand,
        model,
        image_url: imageUrl,
        purchase_url: purchaseUrl || null,
        notes: notes || null,
      }

      if (peripheral) {
        // Update existing
        const { error } = await supabase
          .from('peripherals')
          .update(peripheralData)
          .eq('id', peripheral.id)

        if (error) throw error
        toast.success('Peripheral updated!')
      } else {
        // Create new
        const { error } = await supabase.from('peripherals').insert(peripheralData)

        if (error) throw error
        toast.success('Peripheral added!')
      }

      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save peripheral')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {peripheral ? 'Edit Peripheral' : 'Add Peripheral'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" disabled={loading}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Category *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="input"
              required
              disabled={loading}
            >
              <option value="mouse">Mouse</option>
              <option value="keyboard">Keyboard</option>
              <option value="mousepad">Mousepad</option>
              <option value="headset">Headset</option>
              <option value="monitor">Monitor</option>
              <option value="microphone">Microphone</option>
              <option value="controller">Controller</option>
              <option value="chair">Chair</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="brand" className="block text-sm font-medium mb-2">
              Brand *
            </label>
            <input
              id="brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="input"
              placeholder="Logitech"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium mb-2">
              Model *
            </label>
            <input
              id="model"
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="input"
              placeholder="G Pro X Superlight"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Image</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
                disabled={loading}
              />
              <label
                htmlFor="image-upload"
                className={`flex items-center justify-center gap-2 w-full px-4 py-6 border-2 border-dashed border-dark-700 rounded-lg cursor-pointer hover:border-primary-600 transition-all ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="h-5 w-5" />
                <span>
                  {imageFile
                    ? imageFile.name
                    : peripheral?.image_url
                    ? 'Change image'
                    : 'Upload image (max 5MB)'}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="purchaseUrl" className="block text-sm font-medium mb-2">
              Purchase URL
            </label>
            <input
              id="purchaseUrl"
              type="url"
              value={purchaseUrl}
              onChange={(e) => setPurchaseUrl(e.target.value)}
              className="input"
              placeholder="https://..."
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="textarea"
              placeholder="Any additional details..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : peripheral ? (
                'Update'
              ) : (
                'Add Peripheral'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
