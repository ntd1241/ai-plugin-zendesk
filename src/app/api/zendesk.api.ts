import * as zaf from 'zendesk_app_framework_sdk'
const client = zaf.init()

export default client



export const getTicket = async () => {
    
    const ticket = (await client.get("ticket")).ticket;
    const { comments } = await client.request({
       url: `/api/v2/tickets/${ticket.id}/comments.json`,
    });
 
    const internalComments = comments.filter((comment: any) => !comment.public);
    const publicComments = ticket.comments.filter(
       (comment: any) => !internalComments.find((internalComment: any) => comment.id === internalComment.id)
    );
    const commentsWithDates = comments
       .map(({ id, created_at }: { id: string; created_at: string }) => {
          const comment = publicComments.find((publicComment: any) => id === publicComment.id);
          return comment && { created_at, ...comment };
       })
       .filter(Boolean);
 
    return { ...ticket, comments: commentsWithDates };
 };