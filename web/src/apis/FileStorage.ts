import { get } from "@/utils/fetch";

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/FileStorage/Upload', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.json();
};


export const getFile = async (id: string) => {
  const response = await get(`/api/FileStorage?id=${id}`);
  const fileStream = await response.blob();
  return fileStream;
};




