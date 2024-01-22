import { System } from "@common/types";
import { Pill } from "@renderer/components/Showcase";
import { useMemo } from "react";

const useSystemPills = (system: System | null) => {
  const pillElems = useMemo<Pill[]>(() => {
    if(!system) return [];
    return []
  }, [system])

  return pillElems;
}

export default useSystemPills;
