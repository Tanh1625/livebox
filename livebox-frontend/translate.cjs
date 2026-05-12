const fs = require('fs');
let content = fs.readFileSync('src/features/server/components/OwnedServersScreen.tsx', 'utf-8');

const replacements = {
  'Yeu cau khong hop le': 'Bad request',
  'Khong co quyen thao tac': 'Permission denied',
  'Khong tim thay server': 'Server not found',
  'Xung dot du lieu': 'Data conflict',
  'Du lieu da het han': 'Data expired',
  'Da xay ra loi he thong': 'System error occurred',
  'Da xay ra loi': 'An error occurred',
  'Khong the tai danh sach server. Vui long thu lai.': 'Failed to load server list. Please try again.',
  'Khong the mo form chinh sua server. Vui long thu lai.': 'Failed to open server edit form. Please try again.',
  'Ban co chac chan muon xoa server "': 'Are you sure you want to delete server "',
  '" khong? Hanh dong nay khong the hoan tac!': '"? This action cannot be undone!',
  'Da xoa server': 'Server deleted',
  'da duoc xoa.': 'has been deleted.',
  'Khong the xoa server. Vui long thu lai.': 'Failed to delete server. Please try again.',
  'Khong the tai danh sach channel. Vui long thu lai.': 'Failed to load channels. Please try again.',
  'Ten channel khong hop le': 'Invalid channel name',
  'Vui long nhap ten channel truoc khi tao.': 'Please enter a channel name before creating.',
  'Khong the tao channel. Vui long thu lai.': 'Failed to create channel. Please try again.',
  'Da tao channel': 'Channel created',
  'cho server': 'for server',
  'Vui long nhap ten channel moi truoc khi luu.': 'Please enter a new channel name before saving.',
  'Da doi ten channel thanh "': 'Renamed channel to "',
  'Khong the doi ten channel. Vui long thu lai.': 'Failed to rename channel. Please try again.',
  'Xoa channel "': 'Delete channel "',
  'da bi xoa.': 'has been deleted.',
  'Khong the xoa channel. Vui long thu lai.': 'Failed to delete channel. Please try again.',
  'Cap nhat thanh cong': 'Update successful',
  'Thong tin server da duoc cap nhat thanh cong.': 'Server information updated successfully.',
  'Khong the cap nhat server. Vui long thu lai.': 'Failed to update server. Please try again.',
  'Tao server dau tien': 'Create your first server',
  'Tao server': 'Create server',
  'Dang tai du lieu...': 'Loading data...',
  'Tai lai trang': 'Reload page',
  'Ban chua tao server nao.': 'You haven\'t created any servers yet.',
  'Khong tim thay server phu hop voi tu khoa': 'No servers found matching',
  'Dang mo...': 'Opening...',
  'Chinh sua server': 'Edit server',
  'Dong y': 'OK',
  'Cap nhat ten va avatar cho ': 'Update name and avatar for ',
  'Chua co avatar': 'No avatar',
  'Click vao khung tren de upload anh (Max 5MB).': 'Click the frame above to upload image (Max 5MB).',
  'Ten server': 'Server name',
  'Nhap ten server': 'Enter server name',
  'Doi ten server se cap nhat ngay sau khi ban luu thay doi. Neu backend tra ve loi, popup se hien thi thong bao tuong ung.': 'Changes to the server name are applied immediately upon saving. Errors will be shown in a popup.',
  'Xoa Server': 'Delete Server',
  'Huy': 'Cancel',
  'Dang luu...': 'Saving...',
  'Luu thay doi': 'Save changes',
  'Danh sach channel hien co cua server nay.': 'List of existing channels for this server.',
  'Dang tai channel...': 'Loading channels...',
  'Chua co channel nao.': 'No channels yet.',
  'Dang tao...': 'Creating...',
  'Da cap nhat channel': 'Channel updated',
  'Xoa channel': 'Delete channel',
  'Hanh dong nay khong the hoan tac!': 'This action cannot be undone!'
};

for (const [vi, en] of Object.entries(replacements)) {
  content = content.replaceAll(vi, en);
}

fs.writeFileSync('src/features/server/components/OwnedServersScreen.tsx', content);
console.log("Translation applied!");
