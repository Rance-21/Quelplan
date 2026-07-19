import { invokeApi } from "./invoke";

export interface ChangeLinkExeParams {
  first_id: number;
  second_id: number;
  third_id: number;
  which_is_game: number;
}

export async function changeLinkExe(
  changeLinkExeParams: ChangeLinkExeParams,
): Promise<void> {
  await invokeApi("change_link_exe", {
    change_link_exe_params: changeLinkExeParams,
  });
}
