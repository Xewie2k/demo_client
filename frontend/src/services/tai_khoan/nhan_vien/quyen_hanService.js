const API = 'http://localhost:8080/api/admin/quyen-han'

export const getAllQuyenHan = async () => {
  const res = await fetch(API, {
    method: 'GET',
  })
  if (!res.ok) throw new Error('Load du lieu khong thanh cong')
  return await res.json()
}
