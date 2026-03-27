import { User } from "@/types"
import { Button } from "../Button"


interface Props {
    student: User;
    handleEditStudent: () => void;
}

export const CabezeraModal = ({ student, handleEditStudent }: Props) => {
    return (<>
        <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {student.firstName} {student.lastName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">@{student.username}</p>
            </div>
            <Button onClick={handleEditStudent} variant="primary">
                Editar Estudiante
            </Button>
        </div>

        {/* Student Information */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {student.age && <div><span className="font-medium">Edad:</span> {student.age}</div>}
            {student.documentNumber && <div><span className="font-medium">Documento:</span> {student.documentNumber}</div>}
            {student.phone && <div><span className="font-medium">Teléfono:</span> {student.phone}</div>}
            {student.address && <div><span className="font-medium">Dirección:</span> {student.address}</div>}
        </div>
    </>
    )
}
