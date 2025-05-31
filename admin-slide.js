import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://oaatowhxrefpjlwucvvg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hYXRvd2h4cmVmcGpsd3VjdnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MzgzMDQsImV4cCI6MjA2NDAxNDMwNH0.-Qf6y5JiWVx2P6kYfWv5mQxEEnF7YdFgqT9E4p0jF1g'
const supabase = createClient(supabaseUrl, supabaseKey)

async function loadSlides() {
  const { data, error } = await supabase
    .from('slides')
    .select('*')
    .order('created_at', { ascending: false })
  const container = document.getElementById('slideList')
  if (error) {
    container.innerHTML = `<div style="color:red;">Error: ${error.message}</div>`
    return
  }
  container.innerHTML = !data.length ? "<i>Belum ada slide.</i>" :
    data.map(s => `
      <div class="slide-item">
        <b>${s.title}</b><br>
        <div>${s.desc}</div>
        ${s.image_url ? `<img src="${s.image_url}" loading="lazy">` : ""}
        <small>${new Date(s.created_at).toLocaleString()}</small><br>
        <button onclick="deleteSlide(${s.id}, '${s.image_url || ''}')">Hapus</button>
      </div>
    `).join('')
}

document.getElementById('slideForm').addEventListener('submit', async function(e) {
  e.preventDefault()
  const title = document.getElementById('slideTitle').value
  const desc = document.getElementById('slideDesc').value
  const imageInput = document.getElementById('slideImage')
  if (!imageInput.files.length) {
    alert('Pilih gambar slide!')
    return
  }
  const file = imageInput.files[0]
  const ext = file.name.split('.').pop()
  const fileName = `slide_${Date.now()}.${ext}`

  // Upload ke Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase
    .storage.from('slides')
    .upload(fileName, file, { upsert: false })
  if (uploadError) {
    alert('Gagal upload gambar: ' + uploadError.message)
    return
  }
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/slides/${fileName}`

  // Insert ke tabel slides
  const { error } = await supabase.from('slides').insert([{ title, desc, image_url: imageUrl }])
  if (!error) {
    alert('Berhasil menambah slide!')
    this.reset()
    loadSlides()
  } else {
    alert('Gagal: ' + error.message)
  }
})

window.deleteSlide = async function(id, image_url) {
  if (!confirm('Yakin hapus slide?')) return
  // Hapus data dari tabel
  const { error } = await supabase.from('slides').delete().eq('id', id)
  if (!error) {
    // Hapus gambar dari storage jika ada
    if (image_url) {
      const filePath = image_url.split('/slides/')[1]
      if (filePath) await supabase.storage.from('slides').remove([filePath])
    }
    loadSlides()
  } else {
    alert('Gagal hapus: ' + error.message)
  }
}

loadSlides()
