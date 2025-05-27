import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, MenuItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { FaSearch, FaSortAlphaDown, FaSortAlphaUp, FaUserCog, FaGraduationCap, FaEllipsisH } from 'react-icons/fa';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import accountService, { Account, Role as AccountRole } from '../../services/accountService';
import { useAuth } from '../../api/AuthContext';
import './QuanLyTaiKhoan.css';

type ModalStep = 'select-role' | 'enter-details';
type SearchFilter = 'name' | 'code' | 'email';
type RoleFilter = 'all' | 'student' | 'admin';
type SortDirection = 'asc' | 'desc' | 'none';
type Role = 'Student' | 'Admin';

interface ValidationErrors {
  name?: string;
  email?: string;
  code?: string;
  phone?: string;
  dob?: string;
  major?: string;
  classGroup?: string;
  password?: string;
  specialization?: string;
  faculty?: string;
  trainingType?: string;
  universitySystem?: string;
  classSection?: string;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  code: string;
  role: AccountRole;
  password?: string;
  dob: string;
  major: string;
  specialization: string;
  faculty: string;
  trainingType: string;
  universitySystem: string;
  classGroup: string; 
  classSection: string;
}

const emptyFormData: FormData = {
  name: '',
  phone: '',
  email: '',
  code: '',
  password: '',
  dob: '',
  role: 'Student' as AccountRole,
  major: 'Công nghệ thông tin',
  specialization: 'Khoa học máy tính',
  faculty: 'Công nghệ thông tin',
  trainingType: 'Chính quy - CĐIO',
  universitySystem: 'Đại học - B7',
  classGroup: '67',
  classSection: 'CS2'
};

export const QuanLyTaiKhoan = () => {
  const { user: currentUser } = useAuth();
  
  // State variables  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('name');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [sortDirection, setSortDirection] = useState<SortDirection>('none');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AccountRole>('Student');
  const [viewRole, setViewRole] = useState<AccountRole>('Student');
  const [modalStep, setModalStep] = useState<ModalStep>('select-role');
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [editedData, setEditedData] = useState<FormData>(emptyFormData);
  const [viewAccountData, setViewAccountData] = useState<{
    name: string;
    dob: string;
    email: string;
    phone: string;
    code: string;
    role: AccountRole;
    major: string;
    specialization: string;
    faculty: string;
    trainingType: string;
    universitySystem: string;
    classGroup: string;
    classSection: string;
  }>({...emptyFormData, role: 'Student' as AccountRole});
  const [selectedBatch, setSelectedBatch] = useState('67');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editingAccountId, setEditingAccountId] = useState<number | null>(null);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Fetch accounts on component mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const result = await accountService.getAllAccounts();
        if (result.success) {
          setAccounts(result.data || []);
        } else {
          console.error('Error fetching accounts:', result.error);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };
    fetchAccounts();
  }, []);

  // Event handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, accountId: number) => {
    setAnchorEl(event.currentTarget);
    setEditingAccountId(accountId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // setEditingAccountId(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filter: SearchFilter) => {
    setSearchFilter(filter);
  };

  const handleRoleFilter = (filter: RoleFilter) => {
    setRoleFilter(filter);
  };

  const handleBatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const batchValue = e.target.value;
    setSelectedBatch(batchValue);
    
    const currentCode = formData.code.replace(/\d{2}$/, '');
    setFormData(prevFormData => ({
      ...prevFormData,
      code: currentCode + batchValue,
      classGroup: batchValue
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prevFormData => ({
        ...prevFormData,
        [name]: value
      }));
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name) {
      setEditedData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setModalStep('enter-details');
  };

  const toggleSort = () => {
    setSortDirection(prev => {
      if (prev === 'none') return 'asc';
      if (prev === 'asc') return 'desc';
      return 'none';
    });
  };

  // Validation function
  const validateForm = (): boolean => {
const handleUpdateAccount = async () => {
  if (!editingAccountId || isNaN(Number(editingAccountId))) {
    handleShowAlert('Lỗi', 'ID tài khoản không hợp lệ');
    return;
  }
  // ... rest of the code
};    const newErrors: ValidationErrors = {};
    const dataToValidate = showEditModal ? editedData : formData;
    const role = showEditModal ? viewRole : selectedRole;

    // Validate required fields
    if (!dataToValidate.name?.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }
    if (!dataToValidate.phone?.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    }
    if (!dataToValidate.email?.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else {
      const emailPattern = role === 'Admin' ? /^[^\s@]+@huce\.edu\.vn$/ : /^[^\s@]+@st\.huce\.edu\.vn$/;
      if (!emailPattern.test(dataToValidate.email)) {
        newErrors.email = role === 'Admin' ? 'Email phải kết thúc bằng @huce.edu.vn' : 'Email phải kết thúc bằng @st.huce.edu.vn';
      }
    }
    if (!dataToValidate.code?.trim()) {
      newErrors.code = 'Vui lòng nhập mã số';
    } else {
      const codeRegex = role === 'Admin' ? /^\d{5,7}$/ : /^\d{2,5}\d{2}$/;
      if (!codeRegex.test(dataToValidate.code)) {
        newErrors.code = role === 'Admin' ? 'Mã số phải có 5-7 chữ số' : 'Mã số phải có 2-5 chữ số + 2 số cuối của khóa';
      }
    }

    // Validate password only for new accounts or when changing password
    if (!showEditModal || dataToValidate.password?.trim()) {
      if (!dataToValidate.password || dataToValidate.password.length < 8) {
        newErrors.password = 'Mật khẩu phải có ít nhất 8 kí tự';
      }
    }

    // Additional validation for students
    if (role === 'Student') {
      if (!dataToValidate.dob?.trim()) {
        newErrors.dob = 'Vui lòng nhập ngày sinh';
      } else {
        const dobRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        if (!dobRegex.test(dataToValidate.dob)) {
          newErrors.dob = 'Ngày sinh không hợp lệ (DD/MM/YYYY)';
        }
      }
      if (!dataToValidate.major?.trim()) {
        newErrors.major = 'Vui lòng nhập ngành học';
      }
      if (!dataToValidate.classGroup?.trim()) {
        newErrors.classGroup = 'Vui lòng chọn khóa';
      }
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (field: string, value: string | undefined): string | undefined => {
    if (!value) return undefined;

    switch (field) {
      case 'email':
        const emailPattern = viewRole === 'Admin'
          ? /^[^\s@]+@huce\.edu\.vn$/
          : /^[^\s@]+@st\.huce\.edu\.vn$/;
        if (!emailPattern.test(value)) {
          return viewRole === 'Admin'
            ? 'Email phải kết thúc bằng @huce.edu.vn'
            : 'Email phải kết thúc bằng @st.huce.edu.vn';
        }
        break;

      case 'password':
        if (value.length < 8) {
          return 'Mật khẩu phải có ít nhất 8 kí tự';
        }
        break;

      case 'code':
        const codeRegex = viewRole === 'Admin' ? /^\d{5,7}$/ : /^\d{2,5}\d{2}$/;
        if (!codeRegex.test(value)) {
          return viewRole === 'Admin'
            ? 'Mã số phải có 5-7 chữ số'
            : 'Mã số phải có 2-5 chữ số + 2 số cuối của khóa';
        }
        break;

      case 'dob':
        const dobRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        if (!dobRegex.test(value)) {
          return 'Ngày sinh không hợp lệ (DD/MM/YYYY)';
        }
        break;
    }
    return undefined;
  };

  const handleShowAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlertModal(true);
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) {
      handleShowAlert('Lỗi', 'Vui lòng điền đầy đủ thông tin và sửa các lỗi trong form');
      return;
    }

    try {
      const result = await accountService.createAccount({
        ...formData,
        role: selectedRole
      });

      if (result.success && result.data) {
        setAccounts(prev => [...prev, result.data as Account]);
        handleShowAlert('Thành công', 'Tạo tài khoản mới thành công');
        setShowCreateModal(false);
      } else {
        handleShowAlert('Lỗi', result.error || 'Có lỗi xảy ra khi tạo tài khoản');
      }
    } catch (error: any) {
      handleShowAlert('Lỗi', error.message || 'Có lỗi xảy ra khi tạo tài khoản');
    }
  };

  const handleEditAccount = () => {
    if (!editingAccountId || typeof editingAccountId !== 'number') {
      handleShowAlert('Lỗi', 'ID tài khoản không hợp lệ');
      return;
    }

    // Kiểm tra xem tài khoản có tồn tại không
    const accountToUpdate = accounts.find(acc => acc.id === editingAccountId);
    if (!accountToUpdate) {
      handleShowAlert('Lỗi', 'Không tìm thấy thông tin tài khoản');
      return;
    }
    
    const account = accounts.find(acc => acc.id === editingAccountId);
    if (!account) {
      handleShowAlert('Lỗi', 'Không tìm thấy thông tin tài khoản');
      return;
    }

    // Khởi tạo dữ liệu chỉnh sửa từ tài khoản hiện tại
    const editData: FormData = {
      name: account.name || '',
      email: account.email || '',
      phone: account.phone || '',
      code: account.code || '',
      role: account.role,
      password: '', // Để trống vì không cần cập nhật mật khẩu mỗi lần
      dob: account.studentDetails?.dob || '',
      major: account.studentDetails?.major || 'Công nghệ thông tin',
      specialization: account.studentDetails?.specialization || 'Khoa học máy tính',
      faculty: account.studentDetails?.faculty || 'Công nghệ thông tin',
      trainingType: account.studentDetails?.trainingType || 'Chính quy - CĐIO',
      universitySystem: account.studentDetails?.universitySystem || 'Đại học - B7',
      classGroup: account.studentDetails?.classGroup || '67',
      classSection: account.studentDetails?.classSection || 'CS2'
    };

    // Cập nhật state
    setViewRole(account.role);
    setEditedData(editData);
    setShowEditModal(true);
    handleMenuClose();
  };

  const handleViewAccount = () => {
    if (!editingAccountId) return;
    
    const accountToView = accounts.find(acc => acc.id === editingAccountId);
    if (!accountToView) return;

    // Set view data
    setViewAccountData({
      ...viewAccountData,
      name: accountToView.name,
      email: accountToView.email,
      phone: accountToView.phone,
      code: accountToView.code,
      role: accountToView.role,
      // Add student specific fields if role is Student
      ...(accountToView.role === 'Student' && {
        major: 'Công nghệ thông tin',
        specialization: 'Khoa học máy tính',
        faculty: 'Công nghệ thông tin',
        trainingType: 'Chính quy - CĐIO',
        universitySystem: 'Đại học - B7',
        classGroup: '67',
        classSection: 'CS2',
      })
    });

    setShowViewModal(true);
    // Don't close menu here - let it stay open
  };

  const handleUpdateAccount = async () => {
    if (!validateForm()) {
      handleShowAlert('Lỗi', 'Vui lòng điền đầy đủ thông tin và sửa các lỗi trong form');
      return;
    }

    if (!editingAccountId || typeof editingAccountId !== 'number') {
      handleShowAlert('Lỗi', 'ID tài khoản không hợp lệ');
      return;
    }

    // Kiểm tra xem tài khoản có tồn tại không
    const accountToUpdate = accounts.find(acc => acc.id === editingAccountId);
    if (!accountToUpdate) {
      handleShowAlert('Lỗi', 'Không tìm thấy thông tin tài khoản');
      return;
    }

    try {
      // Chuẩn bị dữ liệu cập nhật
      const updateData = {
        name: editedData.name,
        email: editedData.email,
        phone: editedData.phone,
        code: editedData.code,
        role: viewRole,
        ...(editedData.password ? { password: editedData.password } : {}),
        ...(viewRole === 'Student' ? {
          studentDetails: {
            dob: editedData.dob || '',
            major: editedData.major || 'Công nghệ thông tin',
            specialization: editedData.specialization || 'Khoa học máy tính',
            faculty: editedData.faculty || 'Công nghệ thông tin',
            trainingType: editedData.trainingType || 'Chính quy - CĐIO',
            universitySystem: editedData.universitySystem || 'Đại học - B7',
            classGroup: editedData.classGroup || '67',
            classSection: editedData.classSection || 'CS2'
          }
        } : {})
      };

      console.log('Sending update data:', updateData);
      const result = await accountService.updateAccount(editingAccountId, updateData);
      console.log('Update result:', result);

      if (result.success) {
        // Cập nhật state accounts với dữ liệu mới
        setAccounts(prev => prev.map(acc => 
          acc.id === editingAccountId ? { ...acc, ...result.data } : acc
        ));
        handleShowAlert('Thành công', 'Cập nhật tài khoản thành công');
        handleCloseEditModal();
      } else {
        handleShowAlert('Lỗi', result.error || 'Có lỗi xảy ra khi cập nhật tài khoản');
      }
    } catch (error: any) {
      console.error('Lỗi cập nhật tài khoản:', error);
      handleShowAlert('Lỗi', error.message || 'Có lỗi xảy ra khi cập nhật tài khoản');
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditedData(emptyFormData);
    setEditingAccountId(null);
    setValidationErrors({});
    handleMenuClose();
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewAccountData({
      name: '',
      dob: '',
      email: '',
      phone: '',
      code: '',
      role: 'Student' as AccountRole,
      major: '',
      specialization: '',
      faculty: '',
      trainingType: '',
      universitySystem: '',
      classGroup: '',
      classSection: '',
    });
    setEditingAccountId(null);
    handleMenuClose();
  };

  const handleDeleteAccount = async () => {
    if (!editingAccountId) {
      console.log('No account ID selected for deletion');
      return;
    }

    try {
      console.log('Starting account deletion process for ID:', accounts);
      
      const account = accounts.find(acc => acc.id === editingAccountId);
      const isSelf = account?.id === currentUser?.id;

      console.log('Account to delete:', account);
      console.log('Is deleting own account:', isSelf);

      // Prevent deleting own account
      if (isSelf) {
        console.log('Preventing self-deletion');
        handleShowAlert('Lỗi', 'Không thể xóa tài khoản đang đăng nhập');
        setShowDeleteConfirm(false);
        setEditingAccountId(null);
        return;
      }

      if (!account) {
        console.log('Account not found');
        handleShowAlert('Lỗi', 'Không tìm thấy tài khoản');
        return;
      }

      console.log('Calling accountService.deleteAccount...');
      const result = await accountService.deleteAccount(editingAccountId, account.role);
      console.log('Delete result:', result);

      if (result.success) {
        console.log('Delete successful, updating UI');
        setAccounts(prev => prev.filter(acc => acc.id !== editingAccountId));
        handleShowAlert('Thành công', result.message || 'Xóa tài khoản thành công');
      } else {
        console.log('Delete failed:', result.error);
        // Display specific error message from server
        handleShowAlert('Lỗi', result.error || 'Có lỗi xảy ra khi xóa tài khoản');
      }
    } catch (error: any) {
      console.error('Exception during delete:', error);
      handleShowAlert('Lỗi', error.message || 'Có lỗi xảy ra khi xóa tài khoản');
    }

    setShowDeleteConfirm(false);
    setEditingAccountId(null);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(true);
    handleMenuClose(); // Close menu when showing delete confirmation
  };

  // Filtered and sorted accounts
  const displayedAccounts = accounts
    .filter(account => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchFilter === 'name' ? (account.name || '').toLowerCase().includes(searchLower)
        : searchFilter === 'code' ? (account.code || '').toLowerCase().includes(searchLower)
        : (account.email || '').toLowerCase().includes(searchLower);

      const matchesRole = roleFilter === 'all'
        || (roleFilter === 'student' && account.role === 'Student')
        || (roleFilter === 'admin' && account.role === 'Admin');

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortDirection === 'none') return 0;
      if (sortDirection === 'asc') return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      return b.name.toLowerCase().localeCompare(a.name.toLowerCase());
    });

  // Component return
  return (
    <div className="account-management">
      {/* Header */}
      <div className="header">
        <h1>Quản lý tài khoản</h1>
        <button className="create-btn" onClick={() => setShowCreateModal(true)}>
          Tạo tài khoản mới
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="filter-bar">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {/* Filter Options */}
        <div className="filters">
          <div className="filter-group">
            <span className="filter-label">Tìm theo:</span>
            <div className="filter-options">
              <button
                className={`filter-option ${searchFilter === 'name' ? 'active' : ''}`}
                onClick={() => handleFilterChange('name')}
              >
                Họ tên
              </button>
              <button
                className={`filter-option ${searchFilter === 'code' ? 'active' : ''}`}
                onClick={() => handleFilterChange('code')}
              >
                Mã số
              </button>
              <button
                className={`filter-option ${searchFilter === 'email' ? 'active' : ''}`}
                onClick={() => handleFilterChange('email')}
              >
                Email
              </button>
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Vai trò:</span>
            <div className="filter-options">
              <button
                className={`filter-option ${roleFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleRoleFilter('all')}
              >
                Tất cả
              </button>
              <button
                className={`filter-option ${roleFilter === 'student' ? 'active' : ''}`}
                onClick={() => handleRoleFilter('student')}
              >
                Sinh viên
              </button>
              <button
                className={`filter-option ${roleFilter === 'admin' ? 'active' : ''}`}
                onClick={() => handleRoleFilter('admin')}
              >
                Admin
              </button>
            </div>
          </div>

          <button className="sort-btn" onClick={toggleSort}>
            {sortDirection === 'none' ? (
              'Sắp xếp'
            ) : sortDirection === 'asc' ? (
              <FaSortAlphaDown />
            ) : (
              <FaSortAlphaUp />
            )}
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Họ và tên</th>
              <th>Mã số</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {displayedAccounts.map((account) => (
              <tr key={account.id}>
                <td>{account.name}</td>
                <td>{account.code}</td>
                <td>{account.email}</td>
                <td>
                  <div className={`role-pill role-${account.role.toLowerCase()}`}>
                    {account.role === 'Student' ? 'Sinh viên' : 'Admin'}
                  </div>
                </td>
                <td>
                  <IconButton
                    onClick={(event) => handleMenuOpen(event, account.id)}
                  >
                    <FaEllipsisH />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewAccount}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem thông tin</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditAccount}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa thông tin</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleConfirmDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Xóa thông tin</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create Account Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div className="modal-overlay">
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="modal-header">
                <h2>{modalStep === 'select-role' ? 'Chọn loại tài khoản' : 'Tạo tài khoản mới'}</h2>
                <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
              </div>

              <div className="modal-body">
                {modalStep === 'select-role' ? (
                  <div className="role-selection">
                    <button
                      className="role-btn"
                      onClick={() => handleRoleSelect('Student')}
                    >
                      <FaGraduationCap />
                      <span>Sinh viên</span>
                    </button>
                    <button
                      className="role-btn"
                      onClick={() => handleRoleSelect('Admin')}
                    >
                      <FaUserCog />
                      <span>Quản trị viên</span>
                    </button>
                  </div>
                ) : (
                  <div className="form">
                    <div className="form-row">
                      <label htmlFor="name">Họ và tên</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={validationErrors.name ? 'error' : ''}
                        />
                        {validationErrors.name && (
                          <div className="error-message">{validationErrors.name}</div>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <label htmlFor="phone">Số điện thoại</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={validationErrors.phone ? 'error' : ''}
                        />
                        {validationErrors.phone && (
                          <div className="error-message">{validationErrors.phone}</div>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <label htmlFor="email">Email</label>
                      <div className="input-wrapper">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={validationErrors.email ? 'error' : ''}
                        />
                        {validationErrors.email && (
                          <div className="error-message">{validationErrors.email}</div>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <label htmlFor="code">Mã số</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          id="code"
                          name="code"
                          value={formData.code}
                          onChange={handleInputChange}
                          className={validationErrors.code ? 'error' : ''}
                        />
                        {validationErrors.code && (
                          <div className="error-message">{validationErrors.code}</div>
                        )}
                      </div>
                    </div>

                    {selectedRole === 'Student' && (
                      <>
                        <div className="form-row">
                          <label htmlFor="dob">Ngày sinh</label>
                          <div className="input-wrapper">
                            <input
                              type="text"
                              id="dob"
                              name="dob"
                              value={formData.dob}
                              onChange={handleInputChange}
                              className={validationErrors.dob ? 'error' : ''}
                              placeholder="DD/MM/YYYY"
                            />
                            {validationErrors.dob && (
                              <div className="error-message">{validationErrors.dob}</div>
                            )}
                          </div>
                        </div>

                        <div className="form-row">
                          <label htmlFor="major">Ngành học</label>
                          <div className="input-wrapper">
                            <input
                              type="text"
                              id="major"
                              name="major"
                              value={formData.major}
                              onChange={handleInputChange}
                              className={validationErrors.major ? 'error' : ''}
                            />
                            {validationErrors.major && (
                              <div className="error-message">{validationErrors.major}</div>
                            )}
                          </div>
                        </div>

                        <div className="form-row">
                          <label htmlFor="specialization">Chuyên ngành</label>
                          <div className="input-wrapper">
                            <input
                              type="text"
                              id="specialization"
                              name="specialization"
                              value={formData.specialization}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <label htmlFor="faculty">Khoa</label>
                          <div className="input-wrapper">
                            <input
                              type="text"
                              id="faculty"
                              name="faculty"
                              value={formData.faculty}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <label htmlFor="trainingType">Loại hình đào tạo</label>
                          <div className="input-wrapper">
                            <input
                              type="text"
                              id="trainingType"
                              name="trainingType"
                              value={formData.trainingType}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <label htmlFor="universitySystem">Hệ đại học</label>
                          <div className="input-wrapper">
                            <input
                              type="text"
                              id="universitySystem"
                              name="universitySystem"
                              value={formData.universitySystem}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <label htmlFor="classGroup">Khóa</label>
                          <div className="input-wrapper">
                            <select
                              id="classGroup"
                              name="classGroup"
                              value={formData.classGroup}
                              onChange={handleBatchChange}
                              className={validationErrors.classGroup ? 'error' : ''}
                            >
                              <option value="">Chọn khóa</option>
                              <option value="67">Khóa 67</option>
                              <option value="68">Khóa 68</option>
                              <option value="69">Khóa 69</option>
                            </select>
                            {validationErrors.classGroup && (
                              <div className="error-message">{validationErrors.classGroup}</div>
                            )}
                          </div>
                        </div>

                        <div className="form-row">
                          <label htmlFor="classSection">Lớp</label>
                          <div className="input-wrapper">
                            <select
                              id="classSection"
                              name="classSection"
                              value={formData.classSection}
                              onChange={handleInputChange}
                            >
                              <option value="">Chọn lớp</option>
                              <option value="CS1">CS1</option>
                              <option value="CS2">CS2</option>
                              <option value="IS1">IS1</option>
                              <option value="IS2">IS2</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="form-row">
                      <label htmlFor="password">Mật khẩu</label>
                      <div className="input-wrapper">
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={validationErrors.password ? 'error' : ''}
                        />
                        {validationErrors.password && (
                          <div className="error-message">{validationErrors.password}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                {modalStep === 'select-role' ? (
                  <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                    Hủy
                  </button>
                ) : (
                  <>
                    <button className="back-btn" onClick={() => setModalStep('select-role')}>Quay lại</button>
                    <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                      Hủy
                    </button>
                    <button className="confirm-btn" onClick={handleCreateAccount}>
                      Tạo tài khoản
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Account Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div className="modal-overlay">
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="modal-header">
                <h2>Chỉnh sửa tài khoản</h2>
                <button className="close-btn" onClick={handleCloseEditModal}>×</button>
              </div>

              <div className="modal-body">
                <div className="form">
                  <div className="form-row">
                    <label htmlFor="edit-name">Họ và tên</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="edit-name"
                        name="name"
                        value={editedData.name}
                        onChange={handleEditInputChange}
                        className={validationErrors.name ? 'error' : ''}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <label htmlFor="edit-phone">Số điện thoại</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="edit-phone"
                        name="phone"
                        value={editedData.phone}
                        onChange={handleEditInputChange}
                        className={validationErrors.phone ? 'error' : ''}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <label htmlFor="edit-email">Email</label>
                    <div className="input-wrapper">
                      <input
                        type="email"
                        id="edit-email"
                        name="email"
                        value={editedData.email}
                        onChange={handleEditInputChange}
                        className={validationErrors.email ? 'error' : ''}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <label htmlFor="edit-code">Mã số</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="edit-code"
                        name="code"
                        value={editedData.code}
                        onChange={handleEditInputChange}
                        className={validationErrors.code ? 'error' : ''}
                      />
                    </div>
                  </div>

                  {editedData.role === 'Student' && (
                    <>
                      <div className="form-row">
                        <label htmlFor="edit-dob">Ngày sinh</label>
                        <div className="input-wrapper">
                          <input
                            type="text"
                            id="edit-dob"
                            name="dob"
                            value={editedData.dob}
                            onChange={handleEditInputChange}
                            className={validationErrors.dob ? 'error' : ''}
                            placeholder="DD/MM/YYYY"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <label htmlFor="edit-major">Ngành học</label>
                        <div className="input-wrapper">
                          <input
                            type="text"
                            id="edit-major"
                            name="major"
                            value={editedData.major}
                            onChange={handleEditInputChange}
                            className={validationErrors.major ? 'error' : ''}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <label htmlFor="edit-specialization">Chuyên ngành</label>
                        <div className="input-wrapper">
                          <input
                            type="text"
                            id="edit-specialization"
                            name="specialization"
                            value={editedData.specialization}
                            onChange={handleEditInputChange}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <label htmlFor="edit-faculty">Khoa</label>
                        <div className="input-wrapper">
                          <input
                            type="text"
                            id="edit-faculty"
                            name="faculty"
                            value={editedData.faculty}
                            onChange={handleEditInputChange}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <label htmlFor="edit-training-type">Loại hình đào tạo</label>
                        <div className="input-wrapper">
                          <input
                            type="text"
                            id="edit-training-type"
                            name="trainingType"
                            value={editedData.trainingType}
                            onChange={handleEditInputChange}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <label htmlFor="edit-university-system">Hệ đại học</label>
                        <div className="input-wrapper">
                          <input
                            type="text"
                            id="edit-university-system"
                            name="universitySystem"
                            value={editedData.universitySystem}
                            onChange={handleEditInputChange}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <label htmlFor="edit-class-group">Lớp</label>
                        <div className="input-wrapper">
                          <select
                            id="edit-class-group"
                            name="classGroup"
                            value={editedData.classGroup}
                            onChange={handleEditInputChange}
                            className={validationErrors.classGroup ? 'error' : ''}
                          >
                            <option value="">Chọn lớp</option>
                            <option value="67">Khóa 67</option>
                            <option value="68">Khóa 68</option>
                            <option value="69">Khóa 69</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <label htmlFor="edit-class-section">Tiết học</label>
                        <div className="input-wrapper">
                          <select
                            id="edit-class-section"
                            name="classSection"
                            value={editedData.classSection}
                            onChange={handleEditInputChange}
                          >
                            <option value="">Chọn tiết học</option>
                            <option value="CS1">CS1</option>
                            <option value="CS2">CS2</option>
                            <option value="IS1">IS1</option>
                            <option value="IS2">IS2</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="form-row">
                    <label htmlFor="edit-password">Mật khẩu</label>
                    <div className="input-wrapper">
                      <input
                        type="password"
                        id="edit-password"
                        name="password"
                        value={editedData.password}
                        onChange={handleEditInputChange}
                        placeholder="Để trống nếu không đổi mật khẩu"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="cancel-btn" onClick={handleCloseEditModal}>Hủy</button>
                <button className="confirm-btn" onClick={handleUpdateAccount}>
                  Lưu thay đổi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Account Modal */}
      <AnimatePresence>
        {showViewModal && (
          <motion.div className="modal-overlay">
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="modal-header">
                <h2>Thông tin tài khoản</h2>
                <button className="close-btn" onClick={handleCloseViewModal}>×</button>
              </div>

              <div className="modal-body">
                <div className="view-form">
                  {viewAccountData.role === 'Admin' ? (
                    <div className="form single-col">
                      <div className="form-row">
                        <label>Họ tên:</label>
                        <div className="view-value">{viewAccountData.name}</div>
                      </div>
                      <div className="form-row">
                        <label>Email:</label>
                        <div className="view-value">{viewAccountData.email}</div>
                      </div>
                      <div className="form-row">
                        <label>Điện thoại:</label>
                        <div className="view-value">{viewAccountData.phone}</div>
                      </div>
                      <div className="form-row">
                        <label>Mã số:</label>
                        <div className="view-value">{viewAccountData.code}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="form two-cols">
                      <div className="form-col">
                        <div className="form-row">
                          <label>Họ tên:</label>
                          <div className="view-value">{viewAccountData.name}</div>
                        </div>
                        <div className="form-row">
                          <label>Email:</label>
                          <div className="view-value">{viewAccountData.email}</div>
                        </div>
                        <div className="form-row">
                          <label>Điện thoại:</label>
                          <div className="view-value">{viewAccountData.phone}</div>
                        </div>
                        <div className="form-row">
                          <label>Mã số:</label>
                          <div className="view-value">{viewAccountData.code}</div>
                        </div>
                      </div>
                      <div className="form-col">
                        <div className="form-row">
                          <label>Ngành:</label>
                          <div className="view-value">{viewAccountData.major}</div>
                        </div>
                        <div className="form-row">
                          <label>Chuyên ngành:</label>
                          <div className="view-value">{viewAccountData.specialization}</div>
                        </div>
                        <div className="form-row">
                          <label>Khoa:</label>
                          <div className="view-value">{viewAccountData.faculty}</div>
                        </div>
                        <div className="form-row">
                          <label>Loại hình đào tạo:</label>
                          <div className="view-value">{viewAccountData.trainingType}</div>
                        </div>
                        <div className="form-row">
                          <label>Hệ đại học:</label>
                          <div className="view-value">{viewAccountData.universitySystem}</div>
                        </div>
                        <div className="form-row">
                          <label>Lớp:</label>
                          <div className="view-value">{viewAccountData.classGroup}{viewAccountData.classSection}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button className="cancel-btn" onClick={handleCloseViewModal}>
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div className="modal-overlay">
            <motion.div 
              className="modal-content confirmation-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="modal-header">
                <h2>Xác nhận xóa</h2>
              </div>

              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xóa tài khoản này không?</p>
                <p>Hành động này không thể hoàn tác.</p>
              </div>

              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                  Hủy
                </button>
                <button className="confirm-btn delete-btn" onClick={handleDeleteAccount}>
                  Xóa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Modal */}
      <AnimatePresence>
        {showAlertModal && (
          <motion.div className="modal-overlay alert-overlay">
            <motion.div 
              className="alert-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <h2>{alertTitle}</h2>
              <p>{alertMessage}</p>
              <button onClick={() => setShowAlertModal(false)}>OK</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuanLyTaiKhoan;