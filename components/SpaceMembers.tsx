import { useCurrentSpace } from '@lib/context';
import { useFindManySpaceUser } from '@lib/hooks';
import { Space } from '@prisma/client';
import ManageMembers from './ManageMembers';

function ManagementDialog(space?: Space) {
    if (!space) return undefined;
    return (
        <>
            <label htmlFor="management-modal" className="modal-button">
                + Add collaborator
            </label>

            <input type="checkbox" id="management-modal" className="modal-toggle" />
            <div className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-base md:text-lg">Manage Members of {space.name}</h3>

                    <div className="p-4 mt-4">
                        <ManageMembers space={space} />
                    </div>

                    <div className="modal-action">
                        <label htmlFor="management-modal" className="btn btn-outline">
                            Close
                        </label>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function SpaceMembers() {
    const space = useCurrentSpace();

    const { data: members } = useFindManySpaceUser(
        {
            where: {
                spaceId: space?.id,
            },
            include: {
                user: true,
            },
            orderBy: {
                role: 'desc',
            },
        },
        { disabled: !space }
    );

    return (
        <div className="flex items-center">
            {ManagementDialog(space)}
        </div>
    );
}
