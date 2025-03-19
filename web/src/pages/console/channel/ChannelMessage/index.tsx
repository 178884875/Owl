import { useState, useEffect } from 'react';
import { Flexbox } from "react-layout-kit";
import { Typography, Table, Button, Input, Space, Empty, Pagination, Card, Spin } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { getChatMessageList } from "@/apis/ModelaChannel";
import { ChannelItem } from "../ChannelList";
import { renderNumber } from "@/utils/render";

interface ChannelMessageProps {
  channel: ChannelItem | null;
}

export default function ChannelMessage({ channel }: ChannelMessageProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchMessages = async (page = 1, pageSize = 10) => {
    if (!channel?.id) return;
    
    setLoading(true);
    try {
      const result = await getChatMessageList(channel.id, page, pageSize);
      if (result.success) {
        setMessages(result.data.data || []);
        setPagination({
          ...pagination,
          current: page,
          pageSize,
          total: result.data.totalCount || 0
        });
      }
    } catch (error) {
      console.error("获取消息列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (channel?.id) {
      fetchMessages(1, pagination.pageSize);
    } else {
      setMessages([]);
    }
  }, [channel]);

  const handlePageChange = (page: number, pageSize?: number) => {
    fetchMessages(page, pageSize || pagination.pageSize);
  };

  const handleSearch = () => {
    fetchMessages(1, pagination.pageSize);
  };

  const filteredMessages = searchText
    ? messages.filter(msg => 
        msg.content?.toLowerCase().includes(searchText.toLowerCase()) ||
        msg.model?.toLowerCase().includes(searchText.toLowerCase()) ||
        msg.userName?.toLowerCase().includes(searchText.toLowerCase())
      )
    : messages;

  const columns = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180
    },
    {
      title: '提示词token消耗',
      dataIndex: 'promptTokens',
      key: 'promptTokens',
      width: 120,
      render: (text: number) => renderNumber(text || 0),
    },
    {
      title: '回答token消耗',
      dataIndex: 'completeTokens',
      key: 'completeTokens',
      width: 120,
      render: (text: number) => renderNumber(text || 0),
    },
    {
      title: '响应时间',
      dataIndex: 'responseTime',
      key: 'responseTime',
      width: 120,
      render: (text: number) => {
        // 将毫秒转换为秒
        return `${(text / 1000).toFixed(2)}秒`;
      },
    }
  ];

  return (
    <Flexbox gap={16} style={{ height: '100%', overflow: 'auto' }}>
      <Flexbox horizontal justify="space-between" align="center" style={{ padding: '0 8px' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          渠道消息记录
        </Typography.Title>
        <Space>
          <Input
            placeholder="搜索消息内容、模型或用户"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => fetchMessages(pagination.current, pagination.pageSize)}
          >
            刷新
          </Button>
        </Space>
      </Flexbox>

      {channel?.id ? (
        <Spin spinning={loading}>
          <Card 
            bodyStyle={{ padding: '12px' }}
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <Table
              columns={columns}
              dataSource={filteredMessages}
              rowKey="id"
              pagination={false}
              locale={{
                emptyText: <Empty description="暂无消息记录" />
              }}
            />
            <Flexbox horizontal style={{ justifyContent: 'flex-end', padding: '16px 0 0' }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total) => `共 ${total} 条记录`}
              />
            </Flexbox>
          </Card>
        </Spin>
      ) : (
        <Flexbox 
          style={{ 
            height: '100%', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}
        >
          <Empty description="请选择一个渠道查看消息记录" />
        </Flexbox>
      )}
    </Flexbox>
  );
}
