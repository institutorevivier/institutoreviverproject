import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { Label } from '@/src/components/Label';
import { Modal } from '@/src/components/Modal';
import { User } from '@/types';
import React, { useState } from 'react'
interface StudentEditorModalProps {
    student: User | null;
    onClose: () => void;
    onSave: (studentData: Omit<User, 'role' | 'id'> | User) => Promise<void>;
}

export const StudentEditorModal: React.FC<StudentEditorModalProps> = ({ student, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        firstName: student?.firstName || '',
        lastName: student?.lastName || '',
        username: student?.username || '',
        password:  student?.password || '',
        age: student?.age || undefined,
        documentNumber: student?.documentNumber || '',
        phone: student?.phone || '',
        address: student?.address || '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'age' ? (value ? parseInt(value) : undefined) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const dataToSave = student ? { ...student, ...formData } : { ...formData, role: 'student' as const, id: '' };
        await onSave(dataToSave);
        setLoading(false);
    };

    return (
        <Modal onClose={onClose} title={student ? 'Editar Estudiante' : 'Crear Estudiante'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="firstName">Nombre *</Label><Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required /></div>
                    <div><Label htmlFor="lastName">Apellido *</Label><Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required /></div>
                    <div><Label htmlFor="username">Nombre de usuario *</Label><Input id="username" name="username" value={formData.username} onChange={handleChange} required /></div>
                    <div><Label htmlFor="password">Contraseña {student ? '(mantenga en blanco para mantener actual)' : '*'}</Label><Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required={!student} /></div>
                    <div><Label htmlFor="age">Edad</Label><Input id="age" name="age" type="number" value={formData.age || ''} onChange={handleChange} /></div>
                    <div><Label htmlFor="documentNumber">Numero de documento</Label><Input id="documentNumber" name="documentNumber" value={formData.documentNumber} onChange={handleChange} /></div>
                    <div><Label htmlFor="phone">Telefono</Label><Input id="phone" name="phone" value={formData.phone} onChange={handleChange} /></div>
                    <div><Label htmlFor="address">Direccion</Label><Input id="address" name="address" value={formData.address} onChange={handleChange} /></div>
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
                </div>
            </form>
        </Modal>
    );
};
