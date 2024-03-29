import { TeamMemberItemType } from "atoms/app";
import { Stack } from "expo-router";
import { useTeamMembersState } from "hooks/appState";
import React, { useMemo } from "react";
import { listToDocsObj } from "utils/common";

interface RefillerInfoProps {
  id: string;
}

const RefillerInfo: React.FC<RefillerInfoProps> = ({ id }) => {
  const [teamMembers] = useTeamMembersState();

  const teamMembersObj: { [key: string]: TeamMemberItemType } = useMemo(() => {
    return listToDocsObj(teamMembers.items);
  }, [teamMembers.items]);

  const teamMemberInfo = useMemo(() => {
    return teamMembersObj[id];
  }, [teamMembersObj, id]);

  if (!teamMembersObj[id]) {
    return null;
  }

  return <Stack.Screen options={{ title: teamMemberInfo.name }} />;
};

export default RefillerInfo;
