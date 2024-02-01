import { useNavigate } from "react-router-dom";
import { useInputModal } from "../InputModal/InputModal";
import { useAtom } from "jotai";
import { useOnInput } from "@renderer/hooks"
import games from "@renderer/atoms/games";
import notifications from "@renderer/atoms/notifications";
import { Input } from "@renderer/enums/Input";
import css from "./SearchHeader.module.scss";
import { IoMdSearch } from "react-icons/io";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  active: boolean
  onExitDown?: () => void
  onExitBack?: () => void
}

const SearchHeader = ({ active, onExitDown, onExitBack }: Props) => {
  const getInput = useInputModal();
  const navigate = useNavigate();
  const [searchGames] = useAtom(games.lists.search);
  const [, addNotification] = useAtom(notifications.add);

  useOnInput(async (input) => {
    switch(input) {
      case Input.DOWN:
        onExitDown?.();
        break;
      case Input.A: {
        const query = await getInput({ label: "Search Games", shiftOnOpen: false, shiftOnSpace: false });
        if(!query) {
          onExitBack?.();
          return;
        }

        const hits = searchGames(query).length;
        if(!hits) {
          addNotification({
            text: `No results for "${query}"!`,
            type: "info",
            timeout: 1.5
          });

          onExitBack?.();
          break;
        }

        navigate(`/games/search/${encodeURIComponent(query)}`);
        break;
      }
      case Input.B:
        onExitBack?.();
        break;
    }
  }, {
    disabled: !active
  })

  return (
    <>
      <AnimatePresence>
        {active && <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: .2, transition: { duration: .1 }}}
          exit={{ opacity: 0, transition: { duration: .1 }}}
          className={css.bgOverlay}
        />}
      </AnimatePresence>
      <motion.div
        initial={{ y: -100 }}
        animate={{
          y: active ? 0 : -100,
          transition: {
            type: "spring",
            stiffness: 200,
            mass: .5,
            damping: 18
          }
        }}
        className={css.searchContainer}
      >
        <div className={css.searchbar}>
          Search
          <IoMdSearch />
        </div>
      </motion.div>
    </>
  )
}

export default SearchHeader
